import { analyticsRepository } from './analytics.repository'

export class WebsiteAnalyticsService {
  constructor(private repo = analyticsRepository) {}

  async getOverview(startDate?: Date, endDate?: Date): Promise<any> {
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
}

export const websiteAnalyticsService = new WebsiteAnalyticsService()
