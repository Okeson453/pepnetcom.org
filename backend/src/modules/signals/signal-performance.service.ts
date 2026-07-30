import { signalsRepository } from './signals.repository'
import { Ok } from '../../shared/result'
import type { Result } from '../../shared/result'
import type { PerformanceStats } from './signals.types'

export class SignalPerformanceService {
  constructor(private repo = signalsRepository) {}

  async calculateStats(): Promise<Result<PerformanceStats, never>> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const [stats, last30Days] = await Promise.all([
      this.repo.getPerformanceStats(),
      this.repo.countSince(thirtyDaysAgo),
    ])
    const totalSignals = stats.reduce((sum, s) => sum + s._count.id, 0)
    const winCount = stats.find((s) => s.result === 'WIN')?._count.id ?? 0
    const lossCount = stats.find((s) => s.result === 'LOSS')?._count.id ?? 0
    const breakEvenCount = stats.find((s) => s.result === 'BREAK_EVEN')?._count.id ?? 0

    const winRate = totalSignals > 0 ? (winCount / totalSignals) * 100 : 0

    return Ok({
      totalSignals,
      winCount,
      lossCount,
      breakEvenCount,
      winRate: Math.round(winRate * 100) / 100,
      averagePips: 0, // Would need aggregation
      averageRr: 0,
      last30Days,
    })
  }
}

export const signalPerformanceService = new SignalPerformanceService()
