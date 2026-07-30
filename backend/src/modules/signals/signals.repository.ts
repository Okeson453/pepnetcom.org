import { prisma } from '../../shared/db/prisma-client'
import type { TransactionClient } from '../../shared/db/transaction'
import type { Signal, SignalPerformance, SignalSubscription, Prisma } from '@prisma/client'

export class SignalsRepository {
  async findMany(params: {
    where?: Prisma.SignalWhereInput
    take?: number
    cursor?: Prisma.SignalWhereUniqueInput
    orderBy?: Prisma.SignalOrderByWithRelationInput
  }): Promise<Signal[]> {
    return prisma.signal.findMany({
      ...params,
      include: { performances: true },
    })
  }

  async findById(id: string): Promise<Signal | null> {
    return prisma.signal.findUnique({
      where: { id },
      include: { performances: true },
    })
  }

  async create(data: Prisma.SignalCreateInput): Promise<Signal> {
    return prisma.signal.create({ data })
  }

  async update(id: string, data: Prisma.SignalUpdateInput): Promise<Signal> {
    return prisma.signal.update({ where: { id }, data })
  }

  async closeSignal(id: string, result: string): Promise<Signal> {
    return prisma.signal.update({
      where: { id },
      data: {
        status: 'CLOSED',
        result: result as any,
        closedAt: new Date(),
      },
    })
  }

  // Performance
  async createPerformance(data: Prisma.SignalPerformanceCreateInput): Promise<SignalPerformance> {
    return prisma.signalPerformance.create({ data })
  }

  async getPerformanceStats(): Promise<any[]> {
    return prisma.signal.groupBy({
      by: ['result'],
      where: { status: 'CLOSED', result: { not: null } },
      _count: { id: true },
    })
  }

  async countSince(date: Date): Promise<number> {
    return prisma.signal.count({ where: { createdAt: { gte: date } } })
  }

  // Subscribers
  async findSubscribers(where?: Prisma.SignalSubscriptionWhereInput): Promise<SignalSubscription[]> {
    return prisma.signalSubscription.findMany({
      where,
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findSubscriberById(id: string): Promise<SignalSubscription | null> {
    return prisma.signalSubscription.findUnique({ where: { id } })
  }

  async findActiveSubscription(userId: string): Promise<SignalSubscription | null> {
    return prisma.signalSubscription.findFirst({ where: { userId, status: 'ACTIVE' } })
  }

  async findPendingSubscription(userId: string, plan: string): Promise<SignalSubscription | null> {
    return prisma.signalSubscription.findFirst({
      where: { userId, plan, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createSubscriber(data: Prisma.SignalSubscriptionCreateInput): Promise<SignalSubscription> {
    return prisma.signalSubscription.create({ data })
  }

  async updateSubscriber(id: string, data: Prisma.SignalSubscriptionUpdateInput, tx: TransactionClient = prisma): Promise<SignalSubscription> {
    return tx.signalSubscription.update({ where: { id }, data })
  }
}

export const signalsRepository = new SignalsRepository()
