import { z } from 'zod'
import { cursorPaginationSchema } from '../../shared/pagination/cursor-pagination'

export const messageListSchema = cursorPaginationSchema

export const messageSendSchema = z.object({
  recipientId: z.string().cuid(),
  content: z.string().min(1),
})

export const messageThreadSchema = z.object({
  userId: z.string().cuid(),
})

export const liveChatStartSchema = z.object({
  subject: z.string().min(1),
})

export const liveChatSendSchema = z.object({
  sessionId: z.string().cuid(),
  content: z.string().min(1),
})

export const emailBroadcastCreateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  recipientFilter: z.record(z.any()).optional(),
})

export const emailBroadcastSendSchema = z.object({
  id: z.string().cuid(),
})

export const notificationMarkReadSchema = z.object({
  ids: z.array(z.string().cuid()).optional(),
  all: z.boolean().optional(),
})
