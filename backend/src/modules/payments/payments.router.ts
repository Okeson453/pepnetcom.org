import { z } from 'zod'
import { router, permissionProcedure, clientProcedure, authedProcedure } from '../../trpc/trpc'
import { paymentsService } from './payments.service'
import {
  paymentInitiateSchema,
  paymentVerifySchema,
  transactionListSchema,
  invoiceListSchema,
  refundRequestSchema,
  refundUpdateSchema,
  gatewayUpdateSchema,
  subscriptionListSchema,
  subscriptionCancelSchema,
  subscriptionCreateSchema,
  paymentIdSchema,
} from './payments.schema'
import { TRPCError } from '@trpc/server'
import { withIdempotencyKey } from '../../shared/concurrency/idempotency'

export const paymentsRouter = router({
  initiate: clientProcedure
    .input(paymentInitiateSchema)
    .mutation(async ({ input, ctx }) => {
      const idempotencyKey = ctx.req.headers.get('idempotency-key') ?? undefined
      const result = await withIdempotencyKey('payments.initiate', ctx.user!.id, idempotencyKey, () =>
        paymentsService.initiatePayment({ ...input, userId: ctx.user!.id }),
      )
      if (!result.success) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: result.error.message })
      }
      return result.data
    }),

  verify: clientProcedure
    .input(paymentVerifySchema)
    .mutation(async ({ input }) => {
      const result = await paymentsService.verifyPayment(input.reference, input.gateway)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  transactions: router({
    list: permissionProcedure('payments:admin')
      .input(transactionListSchema)
      .query(async ({ input }) => {
        return paymentsService.listTransactions(input)
      }),

    getById: authedProcedure
      .input(paymentIdSchema)
      .query(async ({ input, ctx }) => {
        const result = await paymentsService.getTransactionById(input.id, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  invoices: router({
    list: authedProcedure
      .input(invoiceListSchema)
      .query(async ({ ctx }) => {
        return paymentsService.listInvoices(ctx.user!.id, ctx.user!.role)
      }),

    getById: authedProcedure
      .input(paymentIdSchema)
      .query(async ({ input, ctx }) => {
        const result = await paymentsService.getInvoiceById(input.id, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  refunds: router({
    request: clientProcedure
      .input(refundRequestSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await paymentsService.requestRefund(input, ctx.user!.id)
        if (!result.success) {
          const codeMap: Record<string, 'NOT_FOUND' | 'FORBIDDEN' | 'BAD_REQUEST'> = {
            NOT_FOUND: 'NOT_FOUND',
            FORBIDDEN: 'FORBIDDEN',
            VALIDATION_ERROR: 'BAD_REQUEST',
          }
          throw new TRPCError({
            code: codeMap[result.error.code] ?? 'BAD_REQUEST',
            message: result.error.message,
          })
        }
        return result.data
      }),

    list: permissionProcedure('payments:admin').query(async () => {
      return paymentsService.listRefunds()
    }),

    updateStatus: permissionProcedure('payments:admin')
      .input(refundUpdateSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await paymentsService.updateRefundStatus(input.id, input.status, ctx.user!.id)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  gateways: router({
    list: permissionProcedure('payments:admin').query(async () => {
      return paymentsService.listGateways()
    }),

    update: permissionProcedure('payments:admin')
      .input(gatewayUpdateSchema)
      .mutation(async ({ input }) => {
        return paymentsService.updateGatewayConfig(input)
      }),
  }),

  subscriptions: router({
    create: authedProcedure
      .input(subscriptionCreateSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await paymentsService.createSubscription(ctx.user!.id, input.plan, input.gateway, input.email)
        if (!result.success) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: result.error.message })
        }
        return result.data
      }),

    list: authedProcedure
      .input(subscriptionListSchema)
      .query(async ({ ctx }) => {
        return paymentsService.listSubscriptions(ctx.user!.id, ctx.user!.role)
      }),

    cancel: authedProcedure
      .input(subscriptionCancelSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await paymentsService.cancelSubscription(input.id, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),
})
