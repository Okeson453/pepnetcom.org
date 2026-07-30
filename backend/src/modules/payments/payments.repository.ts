import { prisma } from '../../shared/db/prisma-client'
import type { TransactionClient } from '../../shared/db/transaction'
import type { Payment, Invoice, RefundRequest, Subscription, Prisma } from '@prisma/client'

export class PaymentsRepository {
  async findPayments(params: {
    where?: Prisma.PaymentWhereInput
    take?: number
    cursor?: Prisma.PaymentWhereUniqueInput
    orderBy?: Prisma.PaymentOrderByWithRelationInput
  }): Promise<Payment[]> {
    return prisma.payment.findMany({
      ...params,
      include: { order: { select: { id: true, orderNumber: true, status: true } } },
    })
  }

  async findPaymentById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: { order: { select: { id: true, orderNumber: true, status: true } } },
    })
  }

  async findPaymentByGatewayRef(gatewayRef: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { gatewayRef } })
  }

  // All attempts (any status) for an order, most recent first — used to
  // decide whether to reuse a PENDING attempt or refuse a re-charge of an
  // already-SUCCESS order. See §3.2.
  async findPaymentsForOrder(orderId: string): Promise<Payment[]> {
    return prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } })
  }

  async findPaymentByStrategyPurchaseId(strategyPurchaseId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { strategyPurchaseId } })
  }

  async findPaymentBySubscriptionId(subscriptionId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { subscriptionId } })
  }

  async findPaymentBySignalSubscriptionId(signalSubscriptionId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { signalSubscriptionId } })
  }

  async createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({ data })
  }

  async updatePayment(id: string, data: Prisma.PaymentUpdateInput, tx: TransactionClient = prisma): Promise<Payment> {
    return tx.payment.update({ where: { id }, data })
  }

  // Invoices
  async findInvoices(params: {
    where?: Prisma.InvoiceWhereInput
    take?: number
    cursor?: Prisma.InvoiceWhereUniqueInput
    orderBy?: Prisma.InvoiceOrderByWithRelationInput
  }): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      ...params,
      include: { order: { select: { id: true, orderNumber: true, clientId: true } } },
    })
  }

  async findInvoiceById(id: string): Promise<Invoice | null> {
    return prisma.invoice.findUnique({
      where: { id },
      include: { order: { select: { id: true, orderNumber: true, clientId: true } } },
    })
  }

  async createInvoice(data: Prisma.InvoiceCreateInput, tx: TransactionClient = prisma): Promise<Invoice> {
    return tx.invoice.create({ data })
  }

  // Refunds
  async findRefunds(params: {
    where?: Prisma.RefundRequestWhereInput
    take?: number
    cursor?: Prisma.RefundRequestWhereUniqueInput
    orderBy?: Prisma.RefundRequestOrderByWithRelationInput
  }): Promise<RefundRequest[]> {
    return prisma.refundRequest.findMany({
      ...params,
      include: { payment: true, user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    })
  }

  async createRefund(data: Prisma.RefundRequestCreateInput): Promise<RefundRequest> {
    return prisma.refundRequest.create({ data })
  }

  async updateRefund(id: string, data: Prisma.RefundRequestUpdateInput): Promise<RefundRequest> {
    return prisma.refundRequest.update({ where: { id }, data })
  }

  // Subscriptions
  async findSubscriptions(params: {
    where?: Prisma.SubscriptionWhereInput
    take?: number
    cursor?: Prisma.SubscriptionWhereUniqueInput
    orderBy?: Prisma.SubscriptionOrderByWithRelationInput
  }): Promise<Subscription[]> {
    return prisma.subscription.findMany({
      ...params,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    })
  }

  async updateSubscription(id: string, data: Prisma.SubscriptionUpdateInput, tx: TransactionClient = prisma): Promise<Subscription> {
    return tx.subscription.update({ where: { id }, data })
  }

  async findSubscriptionById(id: string): Promise<Subscription | null> {
    return prisma.subscription.findUnique({ where: { id } })
  }

  async findActiveSubscriptionForUser(userId: string): Promise<Subscription | null> {
    return prisma.subscription.findFirst({ where: { userId, status: 'ACTIVE' } })
  }

  async findPendingSubscriptionForUser(userId: string, plan: string): Promise<Subscription | null> {
    return prisma.subscription.findFirst({ where: { userId, plan, status: 'PENDING' }, orderBy: { createdAt: 'desc' } })
  }

  async createSubscription(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
    return prisma.subscription.create({ data })
  }
}

export const paymentsRepository = new PaymentsRepository()
