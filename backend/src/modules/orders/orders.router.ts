import { router, authedProcedure, adminProcedure, clientProcedure, writerProcedure } from '../../trpc/trpc'
import { ordersService } from './orders.service'
import {
  orderListSchema,
  orderCreateSchema,
  orderUpdateStatusSchema,
  orderAssignSchema,
  orderCancelSchema,
  orderIdSchema,
} from './orders.schema'
import { TRPCError } from '@trpc/server'

export const ordersRouter = router({
  list: authedProcedure
    .input(orderListSchema)
    .query(async ({ input, ctx }) => {
      const result = await ordersService.list(input, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
      }
      return result.data
    }),

  getById: authedProcedure
    .input(orderIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await ordersService.getById(input.id, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
          message: result.error.message,
        })
      }
      return result.data
    }),

  create: clientProcedure
    .input(orderCreateSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ordersService.create(input, ctx.user!.id)
      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  updateStatus: writerProcedure
    .input(orderUpdateStatusSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ordersService.updateStatus(input, ctx.user!.id)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  assignStaff: adminProcedure
    .input(orderAssignSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ordersService.assignStaff(input, ctx.user!.id)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  cancel: authedProcedure
    .input(orderCancelSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ordersService.cancel(input, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : result.error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  trackingTimeline: authedProcedure
    .input(orderIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await ordersService.trackingTimeline(input.id, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
          message: result.error.message,
        })
      }
      return result.data
    }),
})
