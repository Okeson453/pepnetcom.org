import { ticketsRepository } from './tickets.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { SupportTicket, TicketReply } from '@prisma/client'

export class TicketsService {
  constructor(private repo = ticketsRepository) {}

  async list(input: any, userId: string, userRole: string): Promise<{ items: SupportTicket[]; nextCursor?: string; hasMore: boolean }> {
    const where: any = {}
    if (input.status) where.status = input.status
    if (input.priority) where.priority = input.priority
    if (userRole === 'CLIENT' || userRole === 'WRITER') {
      where.userId = userId
    }

    const take = (input.limit ?? 20) + 1
    const tickets = await this.repo.findMany({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = tickets.length > (input.limit ?? 20)
    const items = hasMore ? tickets.slice(0, input.limit ?? 20) : tickets
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { items, nextCursor, hasMore }
  }

  async getById(id: string, userId: string, userRole: string): Promise<Result<SupportTicket, NotFoundError | ForbiddenError>> {
    const ticket = await this.repo.findById(id)
    if (!ticket) {
      return Err(new NotFoundError('Ticket', id))
    }
    if (userRole !== 'ADMIN' && ticket.userId !== userId) {
      return Err(new ForbiddenError())
    }
    return Ok(ticket)
  }

  async create(input: any, userId: string): Promise<SupportTicket> {
    return this.repo.create({
      user: { connect: { id: userId } },
      subject: input.subject,
      description: input.description,
      priority: input.priority,
      category: input.category,
      status: 'OPEN',
    })
  }

  async reply(input: any, userId: string, userRole: string): Promise<Result<TicketReply, NotFoundError | ForbiddenError>> {
    const ticket = await this.repo.findById(input.ticketId)
    if (!ticket) {
      return Err(new NotFoundError('Ticket', input.ticketId))
    }
    if (userRole !== 'ADMIN' && ticket.userId !== userId) {
      return Err(new ForbiddenError())
    }
    const reply = await this.repo.createReply({
      ticket: { connect: { id: input.ticketId } },
      user: { connect: { id: userId } },
      content: input.content,
      isInternal: input.isInternal ?? false,
    })
    // Update ticket status if admin replies
    if (userRole === 'ADMIN' && ticket.status === 'OPEN') {
      await this.repo.update(ticket.id, { status: 'IN_PROGRESS' })
    }
    return Ok(reply)
  }

  async updateStatus(id: string, status: string): Promise<Result<SupportTicket, NotFoundError>> {
    const ticket = await this.repo.findById(id)
    if (!ticket) {
      return Err(new NotFoundError('Ticket', id))
    }
    const updated = await this.repo.update(id, {
      status: status as any,
      closedAt: status === 'CLOSED' || status === 'RESOLVED' ? new Date() : undefined,
    })
    return Ok(updated)
  }
}

export const ticketsService = new TicketsService()
