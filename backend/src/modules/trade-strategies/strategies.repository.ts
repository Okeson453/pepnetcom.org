import { prisma } from '../../shared/db/prisma-client'
import type { TransactionClient } from '../../shared/db/transaction'
import type { Strategy, StrategyPurchase, Prisma } from '@prisma/client'

export class StrategiesRepository {
  async findMany(params: {
    where?: Prisma.StrategyWhereInput
    take?: number
    cursor?: Prisma.StrategyWhereUniqueInput
    orderBy?: Prisma.StrategyOrderByWithRelationInput
  }): Promise<Strategy[]> {
    return prisma.strategy.findMany(params)
  }

  async findById(id: string): Promise<Strategy | null> {
    return prisma.strategy.findUnique({ where: { id } })
  }

  async findBySlug(slug: string): Promise<Strategy | null> {
    return prisma.strategy.findUnique({ where: { slug } })
  }

  async create(data: Prisma.StrategyCreateInput): Promise<Strategy> {
    return prisma.strategy.create({ data })
  }

  async update(id: string, data: Prisma.StrategyUpdateInput): Promise<Strategy> {
    return prisma.strategy.update({ where: { id }, data })
  }

  async delete(id: string): Promise<Strategy> {
    return prisma.strategy.delete({ where: { id } })
  }

  // Purchases
  async findPurchasesByUser(userId: string): Promise<StrategyPurchase[]> {
    return prisma.strategyPurchase.findMany({
      where: { userId },
      include: { strategy: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  // "Already purchased" means an ACTIVE purchase exists — PENDING attempts
  // (abandoned/failed checkout) must not block a retry. Mirrors the
  // Payment/Order retry fix in payments.service.ts.
  async findActivePurchase(userId: string, strategyId: string): Promise<StrategyPurchase | null> {
    return prisma.strategyPurchase.findFirst({
      where: { userId, strategyId, status: 'ACTIVE' },
    })
  }

  async findPendingPurchase(userId: string, strategyId: string): Promise<StrategyPurchase | null> {
    return prisma.strategyPurchase.findFirst({
      where: { userId, strategyId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPurchaseById(id: string): Promise<StrategyPurchase | null> {
    return prisma.strategyPurchase.findUnique({ where: { id } })
  }

  async createPurchase(data: Prisma.StrategyPurchaseCreateInput): Promise<StrategyPurchase> {
    return prisma.strategyPurchase.create({ data })
  }

  async updatePurchase(id: string, data: Prisma.StrategyPurchaseUpdateInput, tx: TransactionClient = prisma): Promise<StrategyPurchase> {
    return tx.strategyPurchase.update({ where: { id }, data })
  }

  async getSalesReport(): Promise<any[]> {
    return prisma.strategyPurchase.groupBy({
      by: ['strategyId'],
      where: { status: 'ACTIVE' },
      _count: { userId: true },
      _sum: { amount: true },
    })
  }
}

export const strategiesRepository = new StrategiesRepository()
