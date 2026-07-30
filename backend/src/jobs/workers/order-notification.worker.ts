import { Worker } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { logger } from '../../shared/logging/logger'
import { notificationsService } from '../../modules/communication/notifications.service'

export const orderNotificationWorker = new Worker(
  'order-notifications',
  async (job) => {
    const { userId, title, body, data } = job.data
    logger.info('Sending order notification', { userId, title })
    await notificationsService.createNotification(userId, 'order', title, body, data)
  },
  { connection: redis }
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
orderNotificationWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
