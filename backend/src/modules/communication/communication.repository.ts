import { prisma } from '../../shared/db/prisma-client'
import type { Message, Notification, SupportTicket, TicketReply, Setting, Prisma } from '@prisma/client'

const userSummarySelect = { id: true, firstName: true, lastName: true, avatarUrl: true } as const
const replyUserSummarySelect = { id: true, firstName: true, lastName: true, role: true } as const

export class CommunicationRepository {
  // Messages
  async findMessagesForUser(userId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { recipientId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: userSummarySelect }, recipient: { select: userSummarySelect } },
    })
  }

  async findThreadMessages(userId: string, partnerId: string): Promise<Message[]> {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: userSummarySelect }, recipient: { select: userSummarySelect } },
    })
  }

  async hasExistingThread(userId: string, partnerId: string): Promise<boolean> {
    const count = await prisma.message.count({
      where: {
        OR: [
          { senderId: userId, recipientId: partnerId },
          { senderId: partnerId, recipientId: userId },
        ],
      },
    })
    return count > 0
  }

  async createMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    return prisma.message.create({
      data: {
        sender: { connect: { id: senderId } },
        recipient: { connect: { id: recipientId } },
        content,
      },
      include: { sender: { select: userSummarySelect }, recipient: { select: userSummarySelect } },
    })
  }

  // Live chat (support ticket backed)
  async createLiveChatSession(userId: string, subject: string): Promise<SupportTicket> {
    return prisma.supportTicket.create({
      data: {
        user: { connect: { id: userId } },
        subject,
        description: 'Live chat session',
        status: 'OPEN',
        priority: 'MEDIUM',
        category: 'live_chat',
      },
    })
  }

  async createTicketReply(ticketId: string, userId: string, content: string): Promise<TicketReply> {
    return prisma.ticketReply.create({
      data: {
        ticket: { connect: { id: ticketId } },
        user: { connect: { id: userId } },
        content,
      },
      include: { user: { select: replyUserSummarySelect } },
    })
  }

  // Email broadcast (stored as a setting entry until a dedicated campaign table exists)
  async createEmailCampaign(value: Prisma.InputJsonValue): Promise<Setting> {
    return prisma.setting.create({
      data: {
        key: `email_broadcast_${Date.now()}`,
        value,
        category: 'email_broadcast',
      },
    })
  }

  async findEmailCampaignById(id: string): Promise<Setting | null> {
    const setting = await prisma.setting.findUnique({ where: { id } })
    if (!setting || setting.category !== 'email_broadcast') return null
    return setting
  }

  // Notifications
  async findNotifications(userId: string, take = 50): Promise<Notification[]> {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take })
  }

  async markAllNotificationsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return result.count
  }

  async markNotificationsRead(userId: string, ids: string[]): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, id: { in: ids } },
      data: { isRead: true, readAt: new Date() },
    })
    return result.count
  }

  async createNotification(userId: string, type: string, title: string, body: string, data?: Prisma.InputJsonValue): Promise<Notification> {
    return prisma.notification.create({
      data: { user: { connect: { id: userId } }, type, title, body, data },
    })
  }
}

export const communicationRepository = new CommunicationRepository()
