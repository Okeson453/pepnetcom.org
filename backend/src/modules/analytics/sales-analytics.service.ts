import { analyticsRepository } from './analytics.repository'

export class SalesAnalyticsService {
  constructor(private repo = analyticsRepository) {}

  async getOverview(startDate?: Date, endDate?: Date): Promise<any> {
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
}

export const salesAnalyticsService = new SalesAnalyticsService()
