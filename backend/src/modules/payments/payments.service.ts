import { randomUUID } from 'crypto'
import { Prisma } from '@prisma/client'
import { paymentsRepository } from './payments.repository'
import { ordersRepository } from '../orders/orders.repository'
import { usersRepository } from '../users/users.repository'
import { strategiesRepository } from '../trade-strategies/strategies.repository'
import { signalsRepository } from '../signals/signals.repository'
import { invoiceService } from './invoice.service'
import { refundService } from './refund.service'
import { settingsRepository } from '../settings/settings.repository'
import { withTransaction } from '../../shared/db/transaction'
import { canTransition } from '../orders/order-status.state-machine'
import { paystackAdapter } from '../../integrations/payments/paystack.adapter'
import { flutterwaveAdapter } from '../../integrations/payments/flutterwave.adapter'
import { stripeAdapter } from '../../integrations/payments/stripe.adapter'
import { withLock } from '../../shared/concurrency/distributed-lock'
import type { PaymentGatewayPort, GatewayName } from '../../integrations/payments/payment-gateway.port'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ValidationError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Payment } from '@prisma/client'
import type { PaymentInitiateInput, TransactionListInput, RefundRequestInput } from './payments.schema'
import { PLATFORM_PLAN_CATALOG, type PlatformPlanKey } from './payments.schema'

const gateways: Record<GatewayName, PaymentGatewayPort> = {
  paystack: paystackAdapter,
  flutterwave: flutterwaveAdapter,
  stripe: stripeAdapter,
}

// Amounts are Decimal-backed; compare with a small epsilon rather than exact equality.
const AMOUNT_EPSILON = 0.01

export class PaymentsService {
  constructor(
    private repo = paymentsRepository,
    private ordersRepo = ordersRepository,
    private invoiceSvc = invoiceService,
    private refundSvc = refundService,
  ) {}

  async initiatePayment(
    input: PaymentInitiateInput & { userId: string },
  ): Promise<Result<{ authorizationUrl: string; paymentId: string }, ValidationError>> {
    const gateway = gateways[input.gateway as GatewayName]
    if (!gateway) {
      return Err(new ValidationError('Unsupported payment gateway'))
    }

    const gatewaySettings = await settingsRepository.findByCategory('payment_gateways')
    const gatewayConfig = gatewaySettings.find((s) => s.key === input.gateway)?.value as any
    if (gatewayConfig && gatewayConfig.isActive === false) {
      return Err(new ValidationError(`The ${input.gateway} gateway is currently disabled`))
    }

    // emailVerified now actually gates behavior: unverified accounts can't move money.
    const requestingUser = await usersRepository.findById(input.userId)
    if (!requestingUser || !requestingUser.emailVerified) {
      return Err(new ValidationError('Please verify your email address before making a payment'))
    }

    // Amount integrity: always derive from the authoritative order total server-side.
    // A client-supplied amount is never trusted — `orderId` is required by the
    // schema, so there is no ad-hoc/unlinked path here anymore. Every other
    // payable thing (subscriptions, strategy purchases, signal subscriptions)
    // has its own dedicated, server-priced entry point instead.
    const order = await this.ordersRepo.findById(input.orderId, false)
    if (!order) {
      return Err(new ValidationError('Order not found'))
    }
    if (order.clientId !== input.userId) {
      return Err(new ValidationError('Order does not belong to this user'))
    }
    if (order.status !== 'DRAFT' && order.status !== 'PENDING_PAYMENT') {
      return Err(new ValidationError(`Order is not payable in its current status (${order.status})`))
    }
    const amount = Number(order.totalAmount)
    const currency = order.currency

    // §3.2 fix: an order can accumulate many payment *attempts* (declined
    // card, abandoned checkout) but should never dead-end. Reuse an existing
    // PENDING attempt's gateway session instead of opening a second one, and
    // never re-create against an order that already has a SUCCESS payment.
    const existingForOrder = await this.repo.findPaymentsForOrder(input.orderId)
    const alreadySucceeded = existingForOrder.find((p) => p.status === 'SUCCESS')
    if (alreadySucceeded) {
      return Err(new ValidationError('This order has already been paid'))
    }
    const reusablePending = existingForOrder.find((p) => p.status === 'PENDING')
    if (reusablePending) {
      // Re-open a fresh gateway session for the same payment row rather than
      // creating a duplicate — keeps exactly one PENDING row per order at a time.
      const result = await gateway.initiatePayment({
        amount,
        currency,
        email: input.email,
        reference: `PAY-${randomUUID()}`,
        metadata: input.metadata,
      })
      const updated = await this.repo.updatePayment(reusablePending.id, {
        gatewayRef: result.gatewayRef,
        gateway: input.gateway,
      })
      return Ok({ authorizationUrl: result.authorizationUrl, paymentId: updated.id })
    }

    const reference = `PAY-${randomUUID()}`
    const result = await gateway.initiatePayment({
      amount,
      currency,
      email: input.email,
      reference,
      metadata: input.metadata,
    })

    const payment = await this.repo.createPayment({
      order: { connect: { id: input.orderId } },
      user: { connect: { id: input.userId } },
      amount,
      currency,
      gateway: input.gateway,
      gatewayRef: result.gatewayRef,
      status: 'PENDING',
    })

    return Ok({ authorizationUrl: result.authorizationUrl, paymentId: payment.id })
  }

  /**
   * Same retry-safe, server-derived-amount pattern as initiatePayment's order
   * branch, but targeting a StrategyPurchase instead of an Order. This is the
   * only entry point that puts a strategy purchase in front of a real payment
   * gateway (§9.1 of the audit) — strategies.service.ts::purchase calls this
   * after creating the PENDING StrategyPurchase row, never granting access itself.
   */
  async initiateForStrategyPurchase(
    strategyPurchaseId: string,
    userId: string,
    gatewayName: GatewayName,
    email: string,
  ): Promise<Result<{ authorizationUrl: string; paymentId: string }, ValidationError | NotFoundError>> {
    const gateway = gateways[gatewayName]
    if (!gateway) {
      return Err(new ValidationError('Unsupported payment gateway'))
    }
    const purchase = await strategiesRepository.findPurchaseById(strategyPurchaseId)
    if (!purchase || purchase.userId !== userId) {
      return Err(new NotFoundError('StrategyPurchase', strategyPurchaseId))
    }
    if (purchase.status !== 'PENDING') {
      return Err(new ValidationError(`Strategy purchase is not payable in its current status (${purchase.status})`))
    }

    const amount = Number(purchase.amount)
    const currency = purchase.currency

    const existing = await this.repo.findPaymentByStrategyPurchaseId(purchase.id)
    if (existing?.status === 'PENDING') {
      const result = await gateway.initiatePayment({
        amount,
        currency,
        email,
        reference: `PAY-${randomUUID()}`,
        metadata: { strategyPurchaseId: purchase.id },
      })
      const updated = await this.repo.updatePayment(existing.id, { gatewayRef: result.gatewayRef, gateway: gatewayName })
      return Ok({ authorizationUrl: result.authorizationUrl, paymentId: updated.id })
    }

    const reference = `PAY-${randomUUID()}`
    const result = await gateway.initiatePayment({ amount, currency, email, reference, metadata: { strategyPurchaseId: purchase.id } })
    const payment = await this.repo.createPayment({
      strategyPurchase: { connect: { id: purchase.id } },
      user: { connect: { id: userId } },
      amount,
      currency,
      gateway: gatewayName,
      gatewayRef: result.gatewayRef,
      status: 'PENDING',
    })
    return Ok({ authorizationUrl: result.authorizationUrl, paymentId: payment.id })
  }

  /**
   * §9.2 fix: the SignalSubscription creation path was entirely missing —
   * nothing anywhere created one through a real payment. Identical shape to
   * initiateForStrategyPurchase above.
   */
  async initiateForSignalSubscription(
    signalSubscriptionId: string,
    userId: string,
    gatewayName: GatewayName,
    email: string,
  ): Promise<Result<{ authorizationUrl: string; paymentId: string }, ValidationError | NotFoundError>> {
    const gateway = gateways[gatewayName]
    if (!gateway) {
      return Err(new ValidationError('Unsupported payment gateway'))
    }
    const subscription = await signalsRepository.findSubscriberById(signalSubscriptionId)
    if (!subscription || subscription.userId !== userId) {
      return Err(new NotFoundError('SignalSubscription', signalSubscriptionId))
    }
    if (subscription.status !== 'PENDING') {
      return Err(new ValidationError(`Subscription is not payable in its current status (${subscription.status})`))
    }

    const amount = Number(subscription.amount)
    const currency = subscription.currency

    const existing = await this.repo.findPaymentBySignalSubscriptionId(subscription.id)
    if (existing?.status === 'PENDING') {
      const result = await gateway.initiatePayment({
        amount,
        currency,
        email,
        reference: `PAY-${randomUUID()}`,
        metadata: { signalSubscriptionId: subscription.id },
      })
      const updated = await this.repo.updatePayment(existing.id, { gatewayRef: result.gatewayRef, gateway: gatewayName })
      return Ok({ authorizationUrl: result.authorizationUrl, paymentId: updated.id })
    }

    const reference = `PAY-${randomUUID()}`
    const result = await gateway.initiatePayment({ amount, currency, email, reference, metadata: { signalSubscriptionId: subscription.id } })
    const payment = await this.repo.createPayment({
      signalSubscription: { connect: { id: subscription.id } },
      user: { connect: { id: userId } },
      amount,
      currency,
      gateway: gatewayName,
      gatewayRef: result.gatewayRef,
      status: 'PENDING',
    })
    return Ok({ authorizationUrl: result.authorizationUrl, paymentId: payment.id })
  }

  async verifyPayment(reference: string, gatewayName: string): Promise<Result<Payment, NotFoundError | ValidationError>> {
    const gateway = gateways[gatewayName as GatewayName]
    if (!gateway) {
      return Err(new ValidationError('Unsupported payment gateway'))
    }
    const payment = await this.repo.findPaymentByGatewayRef(reference)
    if (!payment) {
      return Err(new NotFoundError('Payment', reference))
    }

    // Idempotency guard: already-processed payments short-circuit before we re-hit the
    // gateway or re-run any side effect (invoice generation, order transition, events).
    if (payment.status === 'SUCCESS') {
      return Ok(payment)
    }

    // §3.3 fix: a webhook delivery and a client-initiated `payments.verify`
    // call can otherwise race through this entire read-check-act sequence
    // concurrently. A short-lived Redis lock keyed on the payment serializes
    // them; the external gateway call happens *inside* the lock (never hold
    // a DB row lock across it, but a Redis lock is fine and is exactly what
    // it's for here).
    return withLock(`payment:verify:${payment.id}`, 15_000, () => this.doVerifyPayment(payment.id, reference, gatewayName))
  }

  private async doVerifyPayment(paymentId: string, reference: string, gatewayName: string): Promise<Result<Payment, NotFoundError | ValidationError>> {
    const gateway = gateways[gatewayName as GatewayName]!
    // Re-fetch and re-check inside the lock — another request may have
    // completed verification while we were waiting to acquire it.
    const payment = await this.repo.findPaymentById(paymentId)
    if (!payment) {
      return Err(new NotFoundError('Payment', reference))
    }
    if (payment.status === 'SUCCESS') {
      return Ok(payment)
    }

    const result = await gateway.verifyPayment(reference)
    if (!result.success) {
      const updated = await this.repo.updatePayment(payment.id, { status: 'FAILED' })
      return Ok(updated)
    }

    // Amount integrity: validate the gateway-confirmed amount against the order's
    // authoritative total *before* ever marking anything PAID. A mismatch never
    // silently succeeds — it's flagged for manual reconciliation instead.
    if (payment.orderId) {
      const order = await this.ordersRepo.findById(payment.orderId, false)
      if (!order) {
        return Err(new NotFoundError('Order', payment.orderId))
      }
      const amountMismatch = Math.abs(result.amount - Number(order.totalAmount)) > AMOUNT_EPSILON
      const currencyMismatch = result.currency !== order.currency
      if (amountMismatch || currencyMismatch) {
        await this.repo.updatePayment(payment.id, {
          status: 'FLAGGED',
          paidAt: result.paidAt ?? new Date(),
        })
        return Err(
          new ValidationError(
            `Payment amount/currency (${result.amount} ${result.currency}) does not match order total (${order.totalAmount} ${order.currency}); flagged for manual reconciliation, order was NOT marked paid`,
          ),
        )
      }
      if (!canTransition(order.status, 'PAID')) {
        // Order moved out of a payable state between initiation and verification
        // (e.g. cancelled concurrently) — don't force it to PAID.
        await this.repo.updatePayment(payment.id, {
          status: 'FLAGGED',
          paidAt: result.paidAt ?? new Date(),
        })
        return Err(new ValidationError(`Order ${order.id} cannot transition from ${order.status} to PAID; payment flagged for manual reconciliation`))
      }
    }

    // Same amount-integrity treatment for strategy purchases as for orders (§9.1).
    let strategyPurchaseAmountOk = true
    if (payment.strategyPurchaseId) {
      const purchase = await strategiesRepository.findPurchaseById(payment.strategyPurchaseId)
      if (!purchase) {
        return Err(new NotFoundError('StrategyPurchase', payment.strategyPurchaseId))
      }
      const amountMismatch = Math.abs(result.amount - Number(purchase.amount)) > AMOUNT_EPSILON
      const currencyMismatch = result.currency !== purchase.currency
      if (amountMismatch || currencyMismatch) {
        strategyPurchaseAmountOk = false
        await this.repo.updatePayment(payment.id, { status: 'FLAGGED', paidAt: result.paidAt ?? new Date() })
        return Err(
          new ValidationError(
            `Payment amount/currency (${result.amount} ${result.currency}) does not match strategy price (${purchase.amount} ${purchase.currency}); flagged for manual reconciliation, access was NOT granted`,
          ),
        )
      }
    }

    // §9.2: same treatment for the generic platform subscription.
    let platformSubDurationMs = 0
    if (payment.subscriptionId) {
      const subscription = await this.repo.findSubscriptionById(payment.subscriptionId)
      if (!subscription) {
        return Err(new NotFoundError('Subscription', payment.subscriptionId))
      }
      const amountMismatch = Math.abs(result.amount - Number(subscription.amount)) > AMOUNT_EPSILON
      const currencyMismatch = result.currency !== subscription.currency
      if (amountMismatch || currencyMismatch) {
        await this.repo.updatePayment(payment.id, { status: 'FLAGGED', paidAt: result.paidAt ?? new Date() })
        return Err(
          new ValidationError(
            `Payment amount/currency (${result.amount} ${result.currency}) does not match subscription price (${subscription.amount} ${subscription.currency}); flagged for manual reconciliation, access was NOT granted`,
          ),
        )
      }
      platformSubDurationMs = subscription.endDate.getTime() - subscription.startDate.getTime()
    }

    // §9.2: same treatment for signal subscriptions — never flip ACTIVE on an
    // amount/currency mismatch.
    let signalSubDurationMs = 0
    if (payment.signalSubscriptionId) {
      const subscription = await signalsRepository.findSubscriberById(payment.signalSubscriptionId)
      if (!subscription) {
        return Err(new NotFoundError('SignalSubscription', payment.signalSubscriptionId))
      }
      const amountMismatch = Math.abs(result.amount - Number(subscription.amount)) > AMOUNT_EPSILON
      const currencyMismatch = result.currency !== subscription.currency
      if (amountMismatch || currencyMismatch) {
        await this.repo.updatePayment(payment.id, { status: 'FLAGGED', paidAt: result.paidAt ?? new Date() })
        return Err(
          new ValidationError(
            `Payment amount/currency (${result.amount} ${result.currency}) does not match subscription price (${subscription.amount} ${subscription.currency}); flagged for manual reconciliation, access was NOT granted`,
          ),
        )
      }
      signalSubDurationMs = subscription.endDate.getTime() - subscription.startDate.getTime()
    }

    // Payment status + invoice + order transition happen atomically — a crash between
    // any two of these can no longer leave the system in an inconsistent state.
    // Serializable isolation: this is the money-status-flip transaction, so we
    // don't rely solely on the outer Redis lock for correctness under concurrent
    // access from two different process instances that both happen to acquire
    // the lock at different times but overlap on the DB write.
    const updated = await withTransaction(
      async (tx) => {
        const paid = await this.repo.updatePayment(
          payment.id,
          { status: 'SUCCESS', paidAt: result.paidAt ?? new Date() },
          tx,
        )

        if (paid.orderId) {
          try {
            await this.invoiceSvc.generateInvoice(paid.orderId, Number(paid.amount), paid.currency, tx)
          } catch (err) {
            const isDuplicateInvoice = err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
            if (!isDuplicateInvoice) throw err
            // Already invoiced by a concurrent verify call — idempotent no-op.
          }

          // Routed through the state machine + audit trail, same as every other order
          // status change, instead of a bare repository update.
          await this.ordersRepo.updateStatus(paid.orderId, 'PAID', 'Payment confirmed', undefined, tx)
        }

        if (paid.strategyPurchaseId && strategyPurchaseAmountOk) {
          await strategiesRepository.updatePurchase(
            paid.strategyPurchaseId,
            { status: 'ACTIVE', purchasedAt: result.paidAt ?? new Date() },
            tx,
          )
        }

        if (paid.subscriptionId) {
          const paidAt = result.paidAt ?? new Date()
          await this.repo.updateSubscription(
            paid.subscriptionId,
            { status: 'ACTIVE', startDate: paidAt, endDate: new Date(paidAt.getTime() + platformSubDurationMs) },
            tx,
          )
        }

        if (paid.signalSubscriptionId) {
          const paidAt = result.paidAt ?? new Date()
          await signalsRepository.updateSubscriber(
            paid.signalSubscriptionId,
            { status: 'ACTIVE', startDate: paidAt, endDate: new Date(paidAt.getTime() + signalSubDurationMs) },
            tx,
          )
        }

        return paid
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )

    return Ok(updated)
  }

  async listTransactions(input: TransactionListInput): Promise<{ items: Payment[]; nextCursor?: string; hasMore: boolean }> {
    const where: any = {}
    if (input.status) where.status = input.status
    if (input.gateway) where.gateway = input.gateway

    const take = (input.limit ?? 20) + 1
    const payments = await this.repo.findPayments({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = payments.length > (input.limit ?? 20)
    const items = hasMore ? payments.slice(0, input.limit ?? 20) : payments
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { items, nextCursor, hasMore }
  }

  async getTransactionById(id: string, userId: string, userRole: string): Promise<Result<Payment, NotFoundError>> {
    const payment = await this.repo.findPaymentById(id)
    if (!payment) {
      return Err(new NotFoundError('Transaction', id))
    }
    if (userRole === 'CLIENT' && payment.userId !== userId) {
      return Err(new NotFoundError('Transaction', id))
    }
    return Ok(payment)
  }

  async listInvoices(userId: string, userRole: string): Promise<any[]> {
    return this.invoiceSvc.listInvoices(userId, userRole)
  }

  async getInvoiceById(id: string, userId: string, userRole: string): Promise<Result<any, any>> {
    return this.invoiceSvc.getInvoiceById(id, userId, userRole)
  }

  async requestRefund(input: RefundRequestInput, userId: string): Promise<Result<any, any>> {
    return this.refundSvc.requestRefund(input.paymentId, userId, input.reason, input.amount)
  }

  async listRefunds(): Promise<any[]> {
    return this.refundSvc.listRefunds()
  }

  async updateRefundStatus(id: string, status: string, processedBy: string): Promise<Result<any, any>> {
    return this.refundSvc.updateStatus(id, status, processedBy)
  }

  async listGateways(): Promise<any[]> {
    const stored = await settingsRepository.findByCategory('payment_gateways')
    const configByGateway = new Map(stored.map((s) => [s.key, s.value as any]))

    const defaults: Record<GatewayName, { supportedCurrencies: string[] }> = {
      paystack: { supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD'] },
      flutterwave: { supportedCurrencies: ['NGN', 'GHS', 'KES', 'UGX', 'TZS', 'ZMW', 'USD', 'EUR', 'GBP'] },
      stripe: { supportedCurrencies: ['USD', 'EUR', 'GBP', 'NGN'] },
    }

    return (Object.keys(defaults) as GatewayName[]).map((name) => {
      const gatewayConfig = configByGateway.get(name)
      return {
        name,
        // Defaults to active until an admin explicitly disables it via gateways.update.
        isActive: gatewayConfig?.isActive ?? true,
        supportedCurrencies: defaults[name].supportedCurrencies,
        config: gatewayConfig?.config ?? {},
      }
    })
  }

  async updateGatewayConfig(input: { gateway: GatewayName; isActive?: boolean; config?: Record<string, unknown> }): Promise<{ success: boolean; gateway: string; isActive: boolean }> {
    const stored = await settingsRepository.findByCategory('payment_gateways')
    const existing = stored.find((s) => s.key === input.gateway)?.value as any
    const merged = {
      isActive: input.isActive ?? existing?.isActive ?? true,
      config: { ...(existing?.config ?? {}), ...(input.config ?? {}) },
    }
    await settingsRepository.upsertMany('payment_gateways', { [input.gateway]: merged })
    return { success: true, gateway: input.gateway, isActive: merged.isActive }
  }

  /**
   * §9.2 fix: this was the missing creation path for the generic platform
   * Subscription — `listSubscriptions`/`cancelSubscription` existed, but
   * nothing ever created one. Same PENDING → gateway session → verifyPayment
   * flips ACTIVE pattern as strategy purchases and signal subscriptions.
   */
  async createSubscription(
    userId: string,
    plan: PlatformPlanKey,
    gatewayName: GatewayName,
    email: string,
  ): Promise<Result<{ authorizationUrl: string; paymentId: string; subscriptionId: string }, ValidationError | NotFoundError>> {
    const gateway = gateways[gatewayName]
    if (!gateway) {
      return Err(new ValidationError('Unsupported payment gateway'))
    }
    const active = await this.repo.findActiveSubscriptionForUser(userId)
    if (active) {
      return Err(new ValidationError('You already have an active subscription'))
    }
    const planDef = PLATFORM_PLAN_CATALOG[plan]
    const existingPending = await this.repo.findPendingSubscriptionForUser(userId, plan)
    const subscription =
      existingPending ??
      (await this.repo.createSubscription({
        user: { connect: { id: userId } },
        plan,
        amount: planDef.amount,
        currency: planDef.currency,
        interval: planDef.interval,
        status: 'PENDING',
        startDate: new Date(),
        endDate: new Date(Date.now() + planDef.days * 24 * 60 * 60 * 1000),
        autoRenew: true,
        gateway: gatewayName,
      }))

    const amount = Number(subscription.amount)
    const currency = subscription.currency
    const existingPayment = await this.repo.findPaymentBySubscriptionId(subscription.id)
    if (existingPayment?.status === 'PENDING') {
      const result = await gateway.initiatePayment({
        amount,
        currency,
        email,
        reference: `PAY-${randomUUID()}`,
        metadata: { subscriptionId: subscription.id },
      })
      const updated = await this.repo.updatePayment(existingPayment.id, { gatewayRef: result.gatewayRef, gateway: gatewayName })
      return Ok({ authorizationUrl: result.authorizationUrl, paymentId: updated.id, subscriptionId: subscription.id })
    }

    const reference = `PAY-${randomUUID()}`
    const result = await gateway.initiatePayment({ amount, currency, email, reference, metadata: { subscriptionId: subscription.id } })
    const payment = await this.repo.createPayment({
      subscription: { connect: { id: subscription.id } },
      user: { connect: { id: userId } },
      amount,
      currency,
      gateway: gatewayName,
      gatewayRef: result.gatewayRef,
      status: 'PENDING',
    })
    return Ok({ authorizationUrl: result.authorizationUrl, paymentId: payment.id, subscriptionId: subscription.id })
  }

  async listSubscriptions(userId: string, userRole: string): Promise<any[]> {
    const where: any = {}
    if (userRole === 'CLIENT') where.userId = userId
    return this.repo.findSubscriptions({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
    })
  }

  async cancelSubscription(id: string, userId: string, userRole: string): Promise<Result<any, NotFoundError>> {
    const subs = await this.repo.findSubscriptions({ where: { id } })
    if (subs.length === 0) {
      return Err(new NotFoundError('Subscription', id))
    }
    const sub = subs[0]
    if (userRole === 'CLIENT' && sub.userId !== userId) {
      return Err(new NotFoundError('Subscription', id))
    }
    const updated = await this.repo.updateSubscription(id, {
      status: 'CANCELLED',
      autoRenew: false,
    })
    return Ok(updated)
  }
}

export const paymentsService = new PaymentsService()
