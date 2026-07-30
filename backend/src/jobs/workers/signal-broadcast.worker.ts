import { Worker } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { logger } from '../../shared/logging/logger'
import { signalBroadcastService } from '../../modules/signals/signal-broadcast.service'
import { signalsRepository } from '../../modules/signals/signals.repository'

export const signalBroadcastWorker = new Worker(
  'signal-broadcast',
  async (job) => {
    const { signalId } = job.data
    logger.info('Broadcasting signal', { signalId })
    const signal = await signalsRepository.findById(signalId)
    if (signal) {
      await signalBroadcastService.broadcastSignal(signal)
    }
  },
  { connection: redis }
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
signalBroadcastWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
