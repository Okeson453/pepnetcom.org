import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { router, adminProcedure, authedProcedure, publicProcedure } from '../../trpc/trpc'
import { NotFoundError } from '../../shared/errors/domain-error'
import { messagesService } from './messages.service'
import { liveChatService } from './live-chat.service'
import { emailBroadcastService } from './email-broadcast.service'
import { notificationsService } from './notifications.service'
import {
  messageSendSchema,
  messageThreadSchema,
  liveChatStartSchema,
  liveChatSendSchema,
  emailBroadcastCreateSchema,
  emailBroadcastSendSchema,
  notificationMarkReadSchema,
} from './communication.schema'

export const communicationRouter = router({
  messages: router({
    list: authedProcedure.query(async ({ ctx }) => {
      return messagesService.listThreads(ctx.user!.id)
    }),

    getThread: authedProcedure
      .input(messageThreadSchema)
      .query(async ({ input, ctx }) => {
        return messagesService.getThread(ctx.user!.id, input.userId)
      }),

    send: authedProcedure
      .input(messageSendSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await messagesService.sendMessage(ctx.user!.id, ctx.user!.role, input.recipientId, input.content)
        if (!result.success) {
          const code = result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : result.error.code === 'FORBIDDEN' ? 'FORBIDDEN' : 'BAD_REQUEST'
          throw new TRPCError({ code, message: result.error.message })
        }
        return result.data
      }),
  }),

  liveChat: router({
    startSession: authedProcedure
      .input(liveChatStartSchema)
      .mutation(async ({ input, ctx }) => {
        return liveChatService.startSession(ctx.user!.id, input.subject)
      }),

    sendMessage: authedProcedure
      .input(liveChatSendSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await liveChatService.sendMessage(input.sessionId, ctx.user!.id, ctx.user!.role, input.content)
        if (!result.success) {
          throw new TRPCError({
            code: result.error.code === 'NOT_FOUND' ? 'NOT_FOUND' : 'FORBIDDEN',
            message: result.error.message,
          })
        }
        return result.data
      }),
  }),

  emailBroadcast: router({
    create: adminProcedure
      .input(emailBroadcastCreateSchema)
      .mutation(async ({ input }) => {
        return emailBroadcastService.createCampaign(input)
      }),

    send: adminProcedure
      .input(emailBroadcastSendSchema)
      .mutation(async ({ input }) => {
        const result = await emailBroadcastService.sendCampaign(input.id)
        if (!result.success) {
          const code = result.error instanceof NotFoundError ? 'NOT_FOUND' : 'BAD_REQUEST'
          throw new TRPCError({ code, message: result.error.message })
        }
        return result.data
      }),
  }),

  notifications: router({
    list: authedProcedure.query(async ({ ctx }) => {
      return notificationsService.listNotifications(ctx.user!.id)
    }),

    markRead: authedProcedure
      .input(notificationMarkReadSchema)
      .mutation(async ({ input, ctx }) => {
        return notificationsService.markRead(ctx.user!.id, input.ids, input.all)
      }),
  }),
})
