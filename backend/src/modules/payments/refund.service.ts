import { paymentsRepository } from './payments.repository'
import { ordersService } from '../orders/orders.service'
import { paystackAdapter } from '../../integrations/payments/paystack.adapter'
import { flutterwaveAdapter } from '../../integrations/payments/flutterwave.adapter'
import { stripeAdapter } from '../../integrations/payments/stripe.adapter'
import { withLock } from '../../shared/concurrency/distributed-lock'
import type { PaymentGatewayPort, GatewayName } from '../../integrations/payments/payment-gateway.port'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ValidationError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { RefundRequest, Payment } from '@prisma/client'

const gateways: Record<GatewayName, PaymentGatewayPort> = {
  paystack: paystackAdapter,
  flutterwave: flutterwaveAdapter,
  stripe: stripeAdapter,
}

export class RefundService {
  constructor(private repo = paymentsRepository) {}

  private async cumulativeRefunded(paymentId: string, excludeRefundId?: string): Promise<number> {
    const existing = await this.repo.findRefunds({
      where: { paymentId, status: { in: ['APPROVED', 'PROCESSED'] } },
    })
    return existing
      .filter((r) => r.id !== excludeRefundId)
      .reduce((sum, r) => sum + Number(r.amount), 0)
  }

  async requestRefund(
    paymentId: string,
    userId: string,
    reason: string,
    amount?: number,
  ): Promise<Result<RefundRequest, NotFoundError | ValidationError | ForbiddenError>> {
    const payment = await this.repo.findPaymentById(paymentId)
    if (!payment) {
      return Err(new NotFoundError('Payment', paymentId))
    }
    // Ownership check: nothing below this point re-verifies who the payment
    // actually belongs to, so without this any authenticated client could
    // open a refund request against *any* other user's payment — creating a
    // record that echoes back that payment's amount, and (if an admin ever
    // approved it without separately checking who filed it) refunding a
    // completed order that wasn't theirs to touch.
    if (payment.userId !== userId) {
      return Err(new ForbiddenError('This payment does not belong to you'))
    }
    if (payment.status !== 'SUCCESS') {
      return Err(new ValidationError(`Only successful payments can be refunded (this one is ${payment.status})`))
    }
    const refundAmount = amount ?? Number(payment.amount)
    const alreadyRefunded = await this.cumulativeRefunded(paymentId)
    const remaining = Number(payment.amount) - alreadyRefunded
    if (refundAmount > remaining + 0.01) {
      return Err(new ValidationError(`Refund amount (${refundAmount}) exceeds remaining refundable balance (${remaining})`))
    }
    const refund = await this.repo.createRefund({
      payment: { connect: { id: paymentId } },
      user: { connect: { id: userId } },
      amount: refundAmount,
      reason,
      status: 'PENDING',
    })
    return Ok(refund)
  }

  async listRefunds(): Promise<RefundRequest[]> {
    return this.repo.findRefunds({
      take: 50,
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStatus(id: string, status: string, processedBy?: string): Promise<Result<RefundRequest, NotFoundError | ValidationError>> {
    const refunds = await this.repo.findRefunds({ where: { id } })
    if (refunds.length === 0) {
      return Err(new NotFoundError('Refund', id))
    }
    const refund = refunds[0]

    if (status !== 'APPROVED') {
      // Rejections and other status changes don't touch the gateway or payment/order state.
      const updated = await this.repo.updateRefund(id, {
        status: status as any,
        processedBy,
        processedAt: status === 'REJECTED' ? new Date() : undefined,
      })
      return Ok(updated)
    }

    // Approval — actually call the gateway before mutating any local state.
    const payment = await this.repo.findPaymentById(refund.paymentId)
    if (!payment) {
      return Err(new NotFoundError('Payment', refund.paymentId))
    }
    const gateway = gateways[payment.gateway as GatewayName]
    if (!gateway) {
      return Err(new ValidationError(`Unsupported payment gateway: ${payment.gateway}`))
    }
    if (!payment.gatewayRef) {
      return Err(new ValidationError('Payment has no gateway reference to refund against'))
    }

    // §3.6 fix: without this lock, two admins concurrently approving two
    // different refund requests on the same payment can both pass their own
    // "remaining balance" check before either writes back, summing past the
    // original payment amount. Serializes the recompute → check → gateway
    // call → persist sequence per-payment.
    return withLock(`payment:refund:${payment.id}`, 20_000, () => this.approveRefund(refund, payment, gateway, processedBy))
  }

  private async approveRefund(
    refund: RefundRequest,
    payment: Payment,
    gateway: PaymentGatewayPort,
    processedBy?: string,
  ): Promise<Result<RefundRequest, NotFoundError | ValidationError>> {
    const id = refund.id
    const alreadyRefunded = await this.cumulativeRefunded(payment.id, refund.id)
    const remaining = Number(payment.amount) - alreadyRefunded
    if (Number(refund.amount) > remaining + 0.01) {
      return Err(new ValidationError(`Refund amount (${refund.amount}) exceeds remaining refundable balance (${remaining}) — another refund may have been approved concurrently`))
    }

    const gatewayResult = await gateway.refundPayment(payment.gatewayRef!, Number(refund.amount))
    if (!gatewayResult.success) {
      await this.repo.updateRefund(id, {
        status: 'REJECTED',
        processedBy,
        processedAt: new Date(),
      })
      return Err(new ValidationError('Gateway refund call failed; refund request marked REJECTED for review'))
    }

    const updated = await this.repo.updateRefund(id, {
      status: 'PROCESSED',
      processedBy,
      processedAt: new Date(),
    })

    const totalRefundedNow = alreadyRefunded + Number(refund.amount)
    const isFullyRefunded = totalRefundedNow >= Number(payment.amount) - 0.01

    if (isFullyRefunded) {
      await this.repo.updatePayment(payment.id, { status: 'REFUNDED' })
      if (payment.orderId) {
        // Route through the owning module's service (not its repository) so the
        // state-machine validation and audit trail apply, same as any other transition.
        await ordersService.updateStatus({ id: payment.orderId, status: 'REFUNDED' as any, notes: `Refund ${id} processed` }, processedBy ?? 'system')
      }
    }

    return Ok(updated)
  }
}

export const refundService = new RefundService()
