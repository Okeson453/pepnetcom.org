import { logger } from '../../shared/logging/logger'
import { prisma } from '../../shared/db/prisma-client'
import { env } from '../../config/env'

async function sendAlert(queue: string, jobId: string, error: string): Promise<void> {
  if (!env.ALERT_WEBHOOK_URL) return
  try {
    await fetch(env.ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `:rotating_light: Job permanently failed after max retries\n*Queue:* ${queue}\n*Job ID:* ${jobId}\n*Error:* ${error}`,
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch (err) {
    // Alerting failure must never crash job processing — just log it.
    logger.error('Failed to send dead-letter alert', { error: (err as Error).message })
  }
}

/**
 * Attach to every Worker as `worker.on('failed', (job, err) => handleDeadLetter(job, err))`.
 * BullMQ fires 'failed' on every failed attempt, not just the last one — this
 * only persists/alerts once the job has exhausted its configured retries
 * (job.attemptsMade >= job.opts.attempts), so transient retries don't spam
 * the dead-letter table or the alert channel.
 */
export async function handleDeadLetter(job: any, err: Error): Promise<void> {
  const maxAttempts = job?.opts?.attempts ?? 1
  const attemptsMade = job?.attemptsMade ?? maxAttempts
  if (attemptsMade < maxAttempts) {
    return // will be retried by BullMQ — not dead yet
  }

  logger.error('Job failed after max retries', {
    jobId: job.id,
    queue: job.queueName,
    error: err.message,
    data: job.data,
  })

  try {
    await prisma.deadLetterJob.create({
      data: {
        queue: job.queueName ?? 'unknown',
        jobId: String(job.id ?? 'unknown'),
        data: job.data ?? {},
        error: err.message.substring(0, 2000),
      },
    })
  } catch (persistErr) {
    logger.error('Failed to persist dead-letter job record', { error: (persistErr as Error).message })
  }

  await sendAlert(job.queueName ?? 'unknown', String(job.id ?? 'unknown'), err.message)
}
