import { prisma } from '../../shared/db/prisma-client'
import type { GeneratedReport } from '@prisma/client'

export interface DateRange {
  startDate?: Date
  endDate?: Date
}

export class AnalyticsRepository {
  async countActiveUsers(): Promise<number> {
    return prisma.user.count({ where: { deletedAt: null } })
  }

  async countNewUsers(range: DateRange): Promise<number> {
    const where: any = { deletedAt: null }
    if (range.startDate || range.endDate) {
      where.createdAt = {}
      if (range.startDate) where.createdAt.gte = range.startDate
      if (range.endDate) where.createdAt.lte = range.endDate
    }
    return prisma.user.count({ where })
  }

  async countOrders(): Promise<number> {
    return prisma.order.count()
  }

  async sumBlogViews(): Promise<number> {
    const result = await prisma.blogPost.aggregate({ _sum: { views: true } })
    return result._sum.views ?? 0
  }

  async paymentRevenue(range: DateRange): Promise<{ totalRevenue: number; totalTransactions: number }> {
    const where: any = { status: 'SUCCESS' }
    if (range.startDate || range.endDate) {
      where.paidAt = {}
      if (range.startDate) where.paidAt.gte = range.startDate
      if (range.endDate) where.paidAt.lte = range.endDate
    }
    const [totalRevenue, totalTransactions] = await Promise.all([
      prisma.payment.aggregate({ where, _sum: { amount: true } }),
      prisma.payment.count({ where }),
    ])
    return { totalRevenue: Number(totalRevenue._sum.amount ?? 0), totalTransactions }
  }

  async ordersByStatus(): Promise<{ status: string; count: number }[]> {
    const groups = await prisma.order.groupBy({ by: ['status'], _count: { id: true } })
    return groups.map((o: { status: string; _count: { id: number } }) => ({ status: o.status, count: o._count.id }))
  }

  async signalPerformance(range: DateRange): Promise<{
    totalSignals: number
    winCount: number
    lossCount: number
    breakEvenCount: number
  }> {
    const where: any = { status: 'CLOSED', result: { not: null } }
    if (range.startDate || range.endDate) {
      where.createdAt = {}
      if (range.startDate) where.createdAt.gte = range.startDate
      if (range.endDate) where.createdAt.lte = range.endDate
    }
    const [totalSignals, results] = await Promise.all([
      prisma.signal.count({ where }),
      prisma.signal.groupBy({ by: ['result'], where, _count: { id: true } }),
    ])
    const winCount = results.find((r: { result: string | null; _count: { id: number } }) => r.result === 'WIN')?._count.id ?? 0
    const lossCount = results.find((r: { result: string | null; _count: { id: number } }) => r.result === 'LOSS')?._count.id ?? 0
    const breakEvenCount = results.find((r: { result: string | null; _count: { id: number } }) => r.result === 'BREAK_EVEN')?._count.id ?? 0
    return { totalSignals, winCount, lossCount, breakEvenCount }
  }

  async createReport(data: {
    name: string
    type: string
    downloadUrl: string
    storageKey: string
    generatedBy?: string
    startDate?: Date
    endDate?: Date
  }): Promise<GeneratedReport> {
    return prisma.generatedReport.create({ data })
  }

  async findReports(take = 50): Promise<GeneratedReport[]> {
    return prisma.generatedReport.findMany({ orderBy: { createdAt: 'desc' }, take })
  }

  async upsertDailyRollup(date: Date, data: {
    totalUsers: number
    newUsers: number
    totalOrders: number
    totalRevenue: number
    totalSignals: number
    signalWinRate: number
  }): Promise<void> {
    const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
    await prisma.dailyAnalyticsRollup.upsert({
      where: { date: dayStart },
      create: { date: dayStart, ...data },
      update: data,
    })
  }
}

export const analyticsRepository = new AnalyticsRepository()
