import { Queue } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'

const analyticsQueue = new Queue('analytics-rollup', { connection: redis })

export async function scheduleDailyReports(): Promise<void> {
  await analyticsQueue.add('daily-rollup', { date: new Date().toISOString().split('T')[0] }, {
    repeat: { pattern: '0 2 * * *' }, // Daily at 2 AM
  })
}
