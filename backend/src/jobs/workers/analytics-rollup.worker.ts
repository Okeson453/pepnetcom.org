import { Worker } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { logger } from '../../shared/logging/logger'
import { analyticsRepository } from '../../modules/analytics/analytics.repository'

export const analyticsRollupWorker = new Worker(
  'analytics-rollup',
  async (job) => {
    const date = job.data.date ? new Date(job.data.date) : new Date()
    // Roll up "yesterday" by default (the day that's actually complete when this runs).
    const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - 1))
    const dayEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

    logger.info('Running analytics rollup', { date: dayStart.toISOString() })

    const [totalUsers, newUsers, totalOrders, revenue, signals] = await Promise.all([
      analyticsRepository.countActiveUsers(),
      analyticsRepository.countNewUsers({ startDate: dayStart, endDate: dayEnd }),
      analyticsRepository.countOrders(),
      analyticsRepository.paymentRevenue({ startDate: dayStart, endDate: dayEnd }),
      analyticsRepository.signalPerformance({ startDate: dayStart, endDate: dayEnd }),
    ])

    const signalWinRate = signals.totalSignals > 0 ? Math.round((signals.winCount / signals.totalSignals) * 10000) / 100 : 0

    await analyticsRepository.upsertDailyRollup(dayStart, {
      totalUsers,
      newUsers,
      totalOrders,
      totalRevenue: revenue.totalRevenue,
      totalSignals: signals.totalSignals,
      signalWinRate,
    })

    logger.info('Analytics rollup complete', { date: dayStart.toISOString(), newUsers, totalOrders })
  },
  { connection: redis },
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
analyticsRollupWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
