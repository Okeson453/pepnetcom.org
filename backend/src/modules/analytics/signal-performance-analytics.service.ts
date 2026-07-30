import { analyticsRepository } from './analytics.repository'

export class SignalPerformanceAnalyticsService {
  constructor(private repo = analyticsRepository) {}

  async getStats(startDate?: Date, endDate?: Date): Promise<any> {
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
}

export const signalPerformanceAnalyticsService = new SignalPerformanceAnalyticsService()
