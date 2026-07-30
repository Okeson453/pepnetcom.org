import { communicationRepository } from './communication.repository'
import { usersRepository } from '../users/users.repository'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors/domain-error'
import { Ok, Err } from '../../shared/result'
import type { Result } from '../../shared/result'
import type { Message } from '@prisma/client'

export class MessagesService {
  constructor(private repo = communicationRepository) {}

  async listThreads(userId: string): Promise<any[]> {
    const messages = await this.repo.findMessagesForUser(userId)

    // Group by conversation partner
    const threads = new Map<string, any>()
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.recipientId : msg.senderId
      if (!threads.has(partnerId)) {
        threads.set(partnerId, {
          partnerId,
          partner: msg.senderId === userId ? (msg as any).recipient : (msg as any).sender,
          lastMessage: msg,
          unreadCount: msg.recipientId === userId && !msg.isRead ? 1 : 0,
        })
      } else {
        const thread = threads.get(partnerId)
        if (msg.recipientId === userId && !msg.isRead) {
          thread.unreadCount++
        }
      }
    }
    return Array.from(threads.values())
  }

  async getThread(userId: string, partnerId: string): Promise<Message[]> {
    return this.repo.findThreadMessages(userId, partnerId)
  }

  async sendMessage(
    senderId: string,
    senderRole: string,
    recipientId: string,
    content: string,
  ): Promise<Result<Message, NotFoundError | ForbiddenError | ValidationError>> {
    if (senderId === recipientId) {
      return Err(new ValidationError('You cannot send a message to yourself'))
    }

    const recipient = await usersRepository.findById(recipientId)
    if (!recipient) {
      return Err(new NotFoundError('User', recipientId))
    }

    // §9.6 fix: this platform has no formal client<->writer assignment
    // relation to authorize against, so rather than leave direct messaging
    // wide open (any authenticated user could message any other user's ID —
    // harassment and user-enumeration risk), non-admins may only:
    //   (a) message an ADMIN (the support/staff contact path), or
    //   (b) continue a thread that already exists (an admin messaged them
    //       first, or they have prior history with this partner).
    // Admins can message anyone, since they're the ones who legitimately
    // need to initiate contact with clients/writers.
    const isPrivileged = senderRole === 'ADMIN' || recipient.role === 'ADMIN'
    if (!isPrivileged) {
      const existingThread = await this.repo.hasExistingThread(senderId, recipientId)
      if (!existingThread) {
        return Err(new ForbiddenError('You can only message support, or reply within an existing conversation'))
      }
    }

    const message = await this.repo.createMessage(senderId, recipientId, content)
    return Ok(message)
  }
}

export const messagesService = new MessagesService()
