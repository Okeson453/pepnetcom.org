import { Worker, Queue } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { prisma } from '../../shared/db/prisma-client'
import { logger } from '../../shared/logging/logger'

const renewalQueue = new Queue('subscription-renewal', { connection: redis })

export const subscriptionExpiryCheckWorker = new Worker(
  'subscription-expiry-check',
  async () => {
    const expiringSoon = await prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        autoRenew: true,
        endDate: { lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      },
    })

    logger.info('Subscription expiry check', { candidateCount: expiringSoon.length })

    for (const sub of expiringSoon) {
      // Deterministic jobId (subscription + day) so this is safe to enqueue
      // repeatedly without creating duplicate renewal jobs for the same
      // subscription on the same day — BullMQ dedupes by jobId.
      const dateKey = new Date().toISOString().split('T')[0]
      await renewalQueue.add(
        'renewal',
        { subscriptionId: sub.id },
        { jobId: `renewal:${sub.id}:${dateKey}` },
      )
    }
  },
  { connection: redis },
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
subscriptionExpiryCheckWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
