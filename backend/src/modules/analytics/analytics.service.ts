import { randomUUID } from 'crypto'
import { analyticsRepository } from './analytics.repository'
import { s3Adapter } from '../../integrations/storage/s3.adapter'
import { toCsv } from '../../shared/csv'
import type { GeneratedReport } from '@prisma/client'

export class AnalyticsService {
  constructor(private repo = analyticsRepository) {}

  async websiteOverview(startDate?: Date, endDate?: Date): Promise<any> {
    const [totalUsers, newUsers, totalOrders, totalBlogViews] = await Promise.all([
      this.repo.countActiveUsers(),
      this.repo.countNewUsers({ startDate, endDate }),
      this.repo.countOrders(),
      this.repo.sumBlogViews(),
    ])
    return {
      totalUsers,
      newUsers,
      totalOrders,
      totalBlogViews,
      period: { startDate, endDate },
    }
  }

  async salesOverview(startDate?: Date, endDate?: Date): Promise<any> {
    const [revenue, ordersByStatus] = await Promise.all([
      this.repo.paymentRevenue({ startDate, endDate }),
      this.repo.ordersByStatus(),
    ])
    return {
      totalRevenue: revenue.totalRevenue,
      totalTransactions: revenue.totalTransactions,
      ordersByStatus,
      period: { startDate, endDate },
    }
  }

  async signalsPerformance(startDate?: Date, endDate?: Date): Promise<any> {
    const stats = await this.repo.signalPerformance({ startDate, endDate })
    return {
      totalSignals: stats.totalSignals,
      winCount: stats.winCount,
      lossCount: stats.lossCount,
      breakEvenCount: stats.breakEvenCount,
      winRate: stats.totalSignals > 0 ? Math.round((stats.winCount / stats.totalSignals) * 10000) / 100 : 0,
      period: { startDate, endDate },
    }
  }

  /**
   * Builds a real CSV from the same aggregate queries the overview endpoints use,
   * uploads it to storage, and persists a GeneratedReport row with a real signed
   * download URL. 'custom' reports (no dedicated aggregate) export the applied
   * filters as a single-row CSV rather than pretending to support arbitrary
   * custom queries with no defined shape.
   */
  async generateReport(input: {
    name: string
    type: 'sales' | 'signals' | 'website' | 'custom'
    startDate: Date
    endDate: Date
    filters?: Record<string, unknown>
  }, generatedBy?: string): Promise<GeneratedReport> {
    let rows: Record<string, unknown>[]

    switch (input.type) {
      case 'sales': {
        const overview = await this.salesOverview(input.startDate, input.endDate)
        rows = overview.ordersByStatus.length
          ? overview.ordersByStatus.map((o: any) => ({
              status: o.status,
              count: o.count,
              totalRevenue: overview.totalRevenue,
              totalTransactions: overview.totalTransactions,
            }))
          : [{ totalRevenue: overview.totalRevenue, totalTransactions: overview.totalTransactions }]
        break
      }
      case 'signals': {
        const perf = await this.signalsPerformance(input.startDate, input.endDate)
        rows = [perf]
        break
      }
      case 'website': {
        const overview = await this.websiteOverview(input.startDate, input.endDate)
        rows = [overview]
        break
      }
      default:
        rows = [{ note: 'custom report type has no predefined aggregate', filters: JSON.stringify(input.filters ?? {}) }]
    }

    const csv = toCsv(rows)
    const storageKey = `reports/${input.type}/${randomUUID()}.csv`
    const { url } = await s3Adapter.upload(Buffer.from(csv, 'utf-8'), storageKey, 'text/csv')
    const downloadUrl = await s3Adapter.getSignedUrl(storageKey, 3600)

    return this.repo.createReport({
      name: input.name,
      type: input.type,
      downloadUrl,
      storageKey,
      generatedBy,
      startDate: input.startDate,
      endDate: input.endDate,
    })
  }

  async listReports(): Promise<GeneratedReport[]> {
    return this.repo.findReports(50)
  }
}

export const analyticsService = new AnalyticsService()
