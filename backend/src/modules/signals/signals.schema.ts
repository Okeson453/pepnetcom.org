import { z } from 'zod'
import { SignalType, SignalDirection, SignalStatus, SignalResult, SubscriptionStatus } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const signalListSchema = cursorPaginationSchema.extend({
  symbol: z.string().optional(),
  type: z.nativeEnum(SignalType).optional(),
  status: z.nativeEnum(SignalStatus).optional(),
})

export const signalCreateSchema = z.object({
  symbol: z.string().min(1),
  type: z.nativeEnum(SignalType),
  direction: z.nativeEnum(SignalDirection),
  entryPrice: z.coerce.number().positive().optional(),
  stopLoss: z.coerce.number().positive().optional(),
  takeProfit: z.coerce.number().positive().optional(),
  description: z.string().optional(),
  analysis: z.string().optional(),
})

export const signalCloseSchema = z.object({
  id: z.string().cuid(),
  result: z.nativeEnum(SignalResult),
})

export const signalIdSchema = z.object({
  id: z.string().cuid(),
})

export const subscriberUpdateSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(SubscriptionStatus),
})

// §9.2 fix: server-side plan catalog. Amount/interval are always derived from
// this, never trusted from the client request — same principle as order
// totals and strategy prices elsewhere.
export const SIGNAL_PLAN_CATALOG = {
  monthly: { amount: 49, currency: 'USD', interval: 'monthly' as const, days: 30 },
  quarterly: { amount: 129, currency: 'USD', interval: 'quarterly' as const, days: 90 },
  yearly: { amount: 399, currency: 'USD', interval: 'yearly' as const, days: 365 },
}
export type SignalPlanKey = keyof typeof SIGNAL_PLAN_CATALOG

export const signalSubscribeSchema = z.object({
  plan: z.enum(['monthly', 'quarterly', 'yearly']),
  gateway: z.enum(['paystack', 'flutterwave', 'stripe']),
  email: z.string().email(),
})
