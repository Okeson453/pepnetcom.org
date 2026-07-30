import { z } from 'zod'
import { TicketStatus, TicketPriority } from '@prisma/client'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const ticketListSchema = cursorPaginationSchema.extend({
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
})

export const ticketCreateSchema = z.object({
  subject: z.string().min(1),
  description: z.string().min(1),
  priority: z.nativeEnum(TicketPriority).default('MEDIUM'),
  category: z.string().min(1),
})

export const ticketReplySchema = z.object({
  ticketId: z.string().cuid(),
  content: z.string().min(1),
  isInternal: z.boolean().default(false),
})

export const ticketUpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(TicketStatus),
})

export const ticketIdSchema = z.object({
  id: z.string().cuid(),
})
