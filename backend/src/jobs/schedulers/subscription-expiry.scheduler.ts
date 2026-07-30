import { Queue } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'

const expiryCheckQueue = new Queue('subscription-expiry-check', { connection: redis })

/**
 * Registers the recurring BullMQ job that scans for expiring subscriptions.
 * Uses `repeat` (like scheduleDailyReports) instead of running the query once
 * at process startup, so:
 *  - it actually runs every day, not just once per deployment/restart
 *  - it's safe under multiple replicas — BullMQ deduplicates repeatable jobs
 *    by their repeat key, so every instance calling this at boot does NOT
 *    create duplicate recurring schedules.
 */
export async function scheduleSubscriptionExpiryCheck(): Promise<void> {
  await expiryCheckQueue.add(
    'daily-check',
    {},
    {
      repeat: { pattern: '0 3 * * *' }, // Daily at 3 AM
      jobId: 'subscription-expiry-check-daily',
    },
  )
}
