import { z } from 'zod'
import { router, adminProcedure, authedProcedure, writerProcedure, publicProcedure } from '../../trpc/trpc'
import { academicService } from './academic.service'
import {
  academicOrderListSchema,
  academicOrderCreateSchema,
  subjectCreateSchema,
  subjectUpdateSchema,
  assignmentUpdateStatusSchema,
  academicIdSchema,
} from './academic.schema'
import { TRPCError } from '@trpc/server'

export const academicRouter = router({
  orders: router({
    list: adminProcedure
      .input(academicOrderListSchema)
      .query(async ({ input, ctx }) => {
        const result = await academicService.listOrders(input, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something went wrong.' })
        }
        return result.data
      }),

    getById: authedProcedure
      .input(academicIdSchema)
      .query(async ({ input, ctx }) => {
        const result = await academicService.getOrderById(input.id, ctx.user!.id, ctx.user!.role)
        if (!result.success) {
          throw new TRPCError({
            code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: result.error.message,
          })
        }
        return result.data
      }),
  }),

  subjects: router({
    list: publicProcedure.query(async () => {
      return academicService.listSubjects()
    }),

    create: adminProcedure
      .input(subjectCreateSchema)
      .mutation(async ({ input }) => {
        const result = await academicService.createSubject(input)
        if (!result.success) {
          throw new TRPCError({ code: 'CONFLICT', message: result.error.message })
        }
        return result.data
      }),

    update: adminProcedure
      .input(z.object({ id: z.string().cuid(), data: subjectUpdateSchema }))
      .mutation(async ({ input }) => {
        const result = await academicService.updateSubject(input.id, input.data)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),

  assignments: router({
    list: writerProcedure.query(async ({ ctx }) => {
      return academicService.listAssignments(ctx.user!.id, ctx.user!.role)
    }),

    updateStatus: writerProcedure
      .input(assignmentUpdateStatusSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await academicService.updateAssignmentStatus(input.id, input.status, ctx.user!.id)
        if (!result.success) {
          throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
        }
        return result.data
      }),
  }),
})
