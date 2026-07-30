import { z } from 'zod'
import { router, adminProcedure, clientProcedure, authedProcedure } from '../../trpc/trpc'
import { signalsService } from './signals.service'
import { signalBroadcastService } from './signal-broadcast.service'
import {
  signalListSchema,
  signalCreateSchema,
  signalCloseSchema,
  signalIdSchema,
  subscriberUpdateSchema,
  signalSubscribeSchema,
} from './signals.schema'
import { TRPCError } from '@trpc/server'

export const signalsRouter = router({
  list: clientProcedure
    .input(signalListSchema)
    .query(async ({ input, ctx }) => {
      const result = await signalsService.list(input, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({ code: 'FORBIDDEN', message: result.error.message })
      }
      return result.data
    }),

  getById: clientProcedure
    .input(signalIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await signalsService.getById(input.id, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
          message: result.error.message,
        })
      }
      return result.data
    }),

  create: adminProcedure
    .input(signalCreateSchema)
    .mutation(async ({ input }) => {
      return signalsService.create(input)
    }),

  close: adminProcedure
    .input(signalCloseSchema)
    .mutation(async ({ input }) => {
      const result = await signalsService.close(input.id, input.result)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  history: clientProcedure
    .input(signalListSchema)
    .query(async ({ input, ctx }) => {
      const result = await signalsService.history(input, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({ code: 'FORBIDDEN', message: result.error.message })
      }
      return result.data
    }),

  performanceStats: adminProcedure.query(async () => {
    const result = await signalsService.performanceStats()
    if (!result.success) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
    }
    return result.data
  }),

  subscribers: router({
    list: adminProcedure.query(async () => {
      return signalsService.listSubscribers()
    }),

    updateStatus: adminProcedure
      .input(subscriberUpdateSchema)
      .mutation(async ({ input }) => {
        const result = await signalsService.updateSubscriberStatus(input.id, input.status)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),

    subscribe: clientProcedure
      .input(signalSubscribeSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await signalsService.subscribe(ctx.user!.id, input.plan, input.gateway, input.email)
        if (!result.success) {
          const code = result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : result.error.code === 'CONFLICT' ? 'CONFLICT' : 'BAD_REQUEST'
          throw new TRPCError({ code, message: result.error.message })
        }
        return result.data
      }),
  }),
})
