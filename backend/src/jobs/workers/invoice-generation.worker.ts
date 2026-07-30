import { Worker } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { logger } from '../../shared/logging/logger'
import { invoiceService } from '../../modules/payments/invoice.service'

export const invoiceGenerationWorker = new Worker(
  'invoice-generation',
  async (job) => {
    const { orderId, amount, currency } = job.data
    logger.info('Generating invoice', { orderId })
    await invoiceService.generateInvoice(orderId, amount, currency)
  },
  { connection: redis }
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
invoiceGenerationWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
