import { prisma } from '../../shared/db/prisma-client'
import type { SupportTicket, TicketReply, Prisma } from '@prisma/client'

export class TicketsRepository {
  async findMany(params: {
    where?: Prisma.SupportTicketWhereInput
    take?: number
    cursor?: Prisma.SupportTicketWhereUniqueInput
    orderBy?: Prisma.SupportTicketOrderByWithRelationInput
  }): Promise<SupportTicket[]> {
    return prisma.supportTicket.findMany({
      ...params,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        _count: { select: { replies: true } },
      },
    })
  }

  async findById(id: string): Promise<SupportTicket | null> {
    return prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        replies: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
  }

  async create(data: Prisma.SupportTicketCreateInput): Promise<SupportTicket> {
    return prisma.supportTicket.create({ data })
  }

  async update(id: string, data: Prisma.SupportTicketUpdateInput): Promise<SupportTicket> {
    return prisma.supportTicket.update({ where: { id }, data })
  }

  async createReply(data: Prisma.TicketReplyCreateInput): Promise<TicketReply> {
    return prisma.ticketReply.create({
      data,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
    })
  }
}

export const ticketsRepository = new TicketsRepository()
