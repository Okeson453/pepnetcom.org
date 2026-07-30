import { Worker } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { logger } from '../../shared/logging/logger'
import { resendAdapter } from '../../integrations/email/resend.adapter'

export const reportDeliveryWorker = new Worker(
  'report-delivery',
  async (job) => {
    const { orderId, reportUrl, recipientEmail } = job.data
    logger.info('Delivering report', { orderId, recipientEmail })

    const result = await resendAdapter.send(
      recipientEmail,
      'Your order is ready',
      `Your completed work is ready for download: ${reportUrl}\n\nOrder reference: ${orderId}`,
      { html: `<p>Your completed work is ready for download.</p><p><a href="${reportUrl}">Download here</a></p><p>Order reference: ${orderId}</p>` },
    )

    if (!result.success) {
      throw new Error(`Report delivery email failed to send for order ${orderId}`)
    }
  },
  { connection: redis },
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
reportDeliveryWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
