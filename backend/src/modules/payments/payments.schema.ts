import { z } from 'zod'
import { PaymentStatus, InvoiceStatus, RefundStatus, SubscriptionStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

// `orderId` is required: the amount is always derived server-side from the
// order's own `totalAmount` (see payments.service.ts) and is never trusted
// from the client. There is deliberately no "ad-hoc, client-states-the-amount"
// path here anymore — every other payable thing (platform subscriptions,
// strategy purchases, signal subscriptions) has its own dedicated,
// server-priced entry point (createSubscription / initiateForStrategyPurchase
// / initiateForSignalSubscription). If a genuinely new fixed-price product
// needs a generic checkout in the future, it should get a server-side price
// catalog entry and its own dedicated method — not a client-supplied amount
// bolted back onto this endpoint.
export const paymentInitiateSchema = z.object({
  orderId: z.string().cuid(),
  gateway: z.enum(['paystack', 'flutterwave', 'stripe']),
  email: z.string().email(),
  metadata: z.record(z.any()).optional(),
})

export const paymentVerifySchema = z.object({
  reference: z.string(),
  gateway: z.enum(['paystack', 'flutterwave', 'stripe']),
})

export const transactionListSchema = cursorPaginationSchema.extend({
  status: z.nativeEnum(PaymentStatus).optional(),
  gateway: z.string().optional(),
})

export const invoiceListSchema = cursorPaginationSchema

export const refundRequestSchema = z.object({
  paymentId: z.string().cuid(),
  amount: z.coerce.number().positive().optional(),
  reason: z.string().min(1),
})

export const refundUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(RefundStatus),
})

export const gatewayUpdateSchema = z.object({
  gateway: z.enum(['paystack', 'flutterwave', 'stripe']),
  isActive: z.boolean().optional(),
  config: z.record(z.any()).optional(),
})

export const subscriptionListSchema = cursorPaginationSchema

export const subscriptionCancelSchema = z.object({
  id: z.string().cuid(),
})

// Server-side plan catalog for the generic platform subscription — amount and
// interval are always derived from this, never trusted from the client.
export const PLATFORM_PLAN_CATALOG = {
  basic: { amount: 15, currency: 'USD', interval: 'monthly', days: 30 },
  pro: { amount: 39, currency: 'USD', interval: 'monthly', days: 30 },
  pro_yearly: { amount: 399, currency: 'USD', interval: 'yearly', days: 365 },
} as const
export type PlatformPlanKey = keyof typeof PLATFORM_PLAN_CATALOG

export const subscriptionCreateSchema = z.object({
  plan: z.enum(['basic', 'pro', 'pro_yearly']),
  gateway: z.enum(['paystack', 'flutterwave', 'stripe']),
  email: z.string().email(),
})

export const paymentIdSchema = z.object({
  id: z.string().cuid(),
})

export type PaymentInitiateInput = z.infer<typeof paymentInitiateSchema>
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>
export type TransactionListInput = z.infer<typeof transactionListSchema>
export type RefundRequestInput = z.infer<typeof refundRequestSchema>
