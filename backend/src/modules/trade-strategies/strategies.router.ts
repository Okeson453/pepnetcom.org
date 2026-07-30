import { z } from 'zod'
import { router, adminProcedure, clientProcedure, publicProcedure } from '../../trpc/trpc'
import { strategiesService } from './strategies.service'
import {
  strategyListSchema,
  strategyCreateSchema,
  strategyUpdateSchema,
  strategyPurchaseSchema,
  strategyIdSchema,
} from './strategies.schema'
import { TRPCError } from '@trpc/server'

export const strategiesRouter = router({
  list: publicProcedure
    .input(strategyListSchema)
    .query(async ({ input }) => {
      return strategiesService.list(input)
    }),

  getById: publicProcedure
    .input(strategyIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await strategiesService.getById(input.id, ctx.user?.id, ctx.user?.role)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  create: adminProcedure
    .input(strategyCreateSchema)
    .mutation(async ({ input }) => {
      return strategiesService.create(input)
    }),

  update: adminProcedure
    .input(z.object({ id: z.string().cuid(), data: strategyUpdateSchema }))
    .mutation(async ({ input }) => {
      const result = await strategiesService.update(input.id, input.data)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  delete: adminProcedure
    .input(strategyIdSchema)
    .mutation(async ({ input }) => {
      const result = await strategiesService.delete(input.id)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),

  purchase: clientProcedure
    .input(strategyPurchaseSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await strategiesService.purchase(input.strategyId, ctx.user!.id, input.gateway, input.email)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'CONFLICT',
          message: result.error.message,
        })
      }
      return result.data
    }),

  myPurchases: clientProcedure.query(async ({ ctx }) => {
    return strategiesService.myPurchases(ctx.user!.id)
  }),

  salesReport: adminProcedure.query(async () => {
    return strategiesService.salesReport()
  }),
})
