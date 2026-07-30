import { Worker } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { logger } from '../../shared/logging/logger'
import { resendAdapter } from '../../integrations/email/resend.adapter'

export const emailBroadcastWorker = new Worker(
  'email-broadcast',
  async (job) => {
    const { campaignId, subject, body, recipients } = job.data
    logger.info('Sending email broadcast', { campaignId, recipientCount: recipients.length })

    const result = await resendAdapter.sendBulk(recipients, subject, body)

    logger.info('Email broadcast complete', {
      campaignId,
      sent: result.sent,
      failed: result.failed,
    })

    if (!result.success && result.sent === 0) {
      throw new Error(`Email broadcast ${campaignId} failed to send to any recipient`)
    }
  },
  { connection: redis },
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
emailBroadcastWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
