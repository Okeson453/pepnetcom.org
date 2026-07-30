import { z } from 'zod'
import { router, adminProcedure, authedProcedure, writerProcedure } from '../../trpc/trpc'
import { siwesService } from './siwes.service'
import {
  siwesListSchema,
  siwesCreateSchema,
  siwesUpdateSchema,
  siwesAssignWriterSchema,
  siwesUploadReportSchema,
  siwesIdSchema,
} from './siwes.schema'
import { TRPCError } from '@trpc/server'

export const siwesRouter = router({
  list: adminProcedure
    .input(siwesListSchema)
    .query(async ({ input, ctx }) => {
      const result = await siwesService.list(input, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
      }
      return result.data
    }),

  getById: authedProcedure
    .input(siwesIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await siwesService.getById(input.id, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
          message: result.error.message,
        })
      }
      return result.data
    }),

  assignWriter: adminProcedure
    .input(siwesAssignWriterSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await siwesService.assignWriter(input.orderId, input.writerId, ctx.user!.id, input.dueDate)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  uploadCompletedReport: writerProcedure
    .input(siwesUploadReportSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await siwesService.uploadCompletedReport(input.orderId, input.reportUrl, ctx.user!.id)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),

  updateOrderDetails: writerProcedure
    .input(z.object({ id: z.string().cuid(), data: siwesUpdateSchema }))
    .mutation(async ({ input, ctx }) => {
      const result = await siwesService.updateOrderDetails(input.id, input.data, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : result.error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'BAD_REQUEST',
          message: result.error.message,
        })
      }
      return result.data
    }),
})
