import { z } from 'zod'
import { router, adminProcedure, authedProcedure, clientProcedure, writerProcedure } from '../../trpc/trpc'
import { ticketsService } from './tickets.service'
import {
  ticketListSchema,
  ticketCreateSchema,
  ticketReplySchema,
  ticketUpdateStatusSchema,
  ticketIdSchema,
} from './tickets.schema'
import { TRPCError } from '@trpc/server'

export const ticketsRouter = router({
  list: authedProcedure
    .input(ticketListSchema)
    .query(async ({ input, ctx }) => {
      return ticketsService.list(input, ctx.user!.id, ctx.user!.role)
    }),

  getById: authedProcedure
    .input(ticketIdSchema)
    .query(async ({ input, ctx }) => {
      const result = await ticketsService.getById(input.id, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
          message: result.error.message,
        })
      }
      return result.data
    }),

  create: authedProcedure
    .input(ticketCreateSchema)
    .mutation(async ({ input, ctx }) => {
      return ticketsService.create(input, ctx.user!.id)
    }),

  reply: authedProcedure
    .input(ticketReplySchema)
    .mutation(async ({ input, ctx }) => {
      const result = await ticketsService.reply(input, ctx.user!.id, ctx.user!.role)
      if (!result.success) {
        throw new TRPCError({
          code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
          message: result.error.message,
        })
      }
      return result.data
    }),

  updateStatus: adminProcedure
    .input(ticketUpdateStatusSchema)
    .mutation(async ({ input }) => {
      const result = await ticketsService.updateStatus(input.id, input.status)
      if (!result.success) {
        throw new TRPCError({ code: 'NOT_FOUND', message: result.error.message })
      }
      return result.data
    }),
})
