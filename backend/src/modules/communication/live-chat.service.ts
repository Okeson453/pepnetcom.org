import { communicationRepository } from './communication.repository'
import { ticketsRepository } from '../support-tickets/tickets.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { TicketReply } from '@prisma/client'

export class LiveChatService {
  constructor(
    private repo = communicationRepository,
    private ticketsRepo = ticketsRepository,
  ) {}

  async startSession(userId: string, subject: string): Promise<any> {
    return this.repo.createLiveChatSession(userId, subject)
  }

  // "Live chat" sessions are SupportTicket records under the hood (see
  // createLiveChatSession) — this previously let a client post a reply into
  // *any* ticketId, including another client's, since nothing checked who
  // the ticket actually belonged to. tickets.service.ts's `reply` already
  // gets this right (owner or ADMIN only); mirrored here.
  async sendMessage(
    ticketId: string,
    userId: string,
    userRole: string,
    content: string,
  ): Promise<Result<TicketReply, NotFoundError | ForbiddenError>> {
    const ticket = await this.ticketsRepo.findById(ticketId)
    if (!ticket) {
      return Err(new NotFoundError('Chat session', ticketId))
    }
    if (userRole !== 'ADMIN' && ticket.userId !== userId) {
      return Err(new ForbiddenError())
    }
    const reply = await this.repo.createTicketReply(ticketId, userId, content)
    return Ok(reply)
  }
}

export const liveChatService = new LiveChatService()
