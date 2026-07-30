import { serve } from '@hono/node-server'
import { app } from './http/app'
import { env } from './config/env'
import { logger } from './shared/logging/logger'
import { prisma } from './shared/db/prisma-client'
import { redis } from './shared/cache/redis-client'
import { runOutboxRelay } from './events/outbox/outbox-relay.worker'
import { scheduleDailyReports } from './jobs/schedulers/daily-reports.scheduler'
import { scheduleSubscriptionExpiryCheck } from './jobs/schedulers/subscription-expiry.scheduler'
import { startSignalSubscriber } from './modules/signals/signal-broadcast.service'

// §5.2 of the audit: the outbox relay, BullMQ workers, and cron schedulers
// previously always ran inside the same process as the HTTP server. That
// conflates two very different scaling profiles — stateless request handling
// (CPU/network-bound) vs. background processing (I/O-bound, occasionally
// CPU-heavy) — and means scaling HTTP replicas also scales background-job
// concurrency and outbox polling frequency for no reason, or a CPU-heavy
// background job can starve the event loop for concurrent HTTP handling.
//
// PROCESS_ROLE picks what this instance runs as:
//   - 'web'    — HTTP server + SSE fan-out only, no workers/relay/schedulers
//   - 'worker' — workers + outbox relay + schedulers only, no HTTP listener
//   - 'all'    — both, in one process (default; fine for local dev / low replica counts)
// Deploy as two separate process types (two Dockerfile CMDs / two ECS
// services / two Railway services) pointing at the same image with
// PROCESS_ROLE=web and PROCESS_ROLE=worker respectively.
const role = env.PROCESS_ROLE
const runsWeb = role === 'web' || role === 'all'
const runsWorker = role === 'worker' || role === 'all'

let workers: Array<{ close: () => Promise<void> }> = []
let outboxInterval: ReturnType<typeof setInterval> | undefined

if (runsWorker) {
  // Registering these starts each BullMQ Worker listening on its queue (the import's
  // side effect is `new Worker(...)`). Without this, jobs enqueued by the schedulers
  // below (and by services elsewhere, e.g. invoice generation) are never processed —
  // they just accumulate in Redis. Dynamically required so a 'web'-only process never
  // even loads BullMQ Worker instances.
  const { analyticsRollupWorker } = await import('./jobs/workers/analytics-rollup.worker')
  const { emailBroadcastWorker } = await import('./jobs/workers/email-broadcast.worker')
  const { invoiceGenerationWorker } = await import('./jobs/workers/invoice-generation.worker')
  const { orderNotificationWorker } = await import('./jobs/workers/order-notification.worker')
  const { reportDeliveryWorker } = await import('./jobs/workers/report-delivery.worker')
  const { signalBroadcastWorker } = await import('./jobs/workers/signal-broadcast.worker')
  const { subscriptionExpiryCheckWorker } = await import('./jobs/workers/subscription-expiry-check.worker')
  const { subscriptionRenewalWorker } = await import('./jobs/workers/subscription-renewal.worker')

  workers = [
    analyticsRollupWorker,
    emailBroadcastWorker,
    invoiceGenerationWorker,
    orderNotificationWorker,
    reportDeliveryWorker,
    signalBroadcastWorker,
    subscriptionExpiryCheckWorker,
    subscriptionRenewalWorker,
  ]

  // Start schedulers
  scheduleDailyReports().catch((e) => logger.error('Failed to schedule daily reports', { error: e.message }))
  scheduleSubscriptionExpiryCheck().catch((e) => logger.error('Failed to schedule subscription expiry', { error: e.message }))

  // Start outbox relay interval. Safe to run redundantly across replicas
  // (claimPending() uses SELECT ... FOR UPDATE SKIP LOCKED) but only worker
  // replicas run it at all now, instead of every web replica too.
  outboxInterval = setInterval(() => {
    runOutboxRelay().catch((e) => logger.error('Outbox relay error', { error: e.message }))
  }, 5000)

  logger.info('Worker role started', { workerCount: workers.length })
}

let server: ReturnType<typeof serve> | undefined

if (runsWeb) {
  // Closes the §5.1 SSE fan-out gap: subscribes this instance to Redis so a
  // signal broadcast from ANY instance reaches SSE clients connected to THIS
  // one, not just clients on whichever instance triggered the broadcast.
  startSignalSubscriber()

  const port = parseInt(env.PORT, 10)
  server = serve({ fetch: app.fetch, port }, (info) => {
    logger.info('Web role started', { port: info.port, env: env.NODE_ENV })
  })
}

if (!runsWeb && !runsWorker) {
  logger.error(`Invalid PROCESS_ROLE "${role}" — must be 'web', 'worker', or 'all'`)
  process.exit(1)
}

// Graceful shutdown: stop accepting new work, let in-flight requests/jobs finish,
// then close connections. Matters most for payment verification — we don't want a
// deploy to hard-kill a request mid-write.
let shuttingDown = false
async function gracefulShutdown(signal: string): Promise<void> {
  if (shuttingDown) return
  shuttingDown = true
  logger.info(`${signal} received, shutting down gracefully`)

  if (outboxInterval) clearInterval(outboxInterval)

  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit')
    process.exit(1)
  }, 15000)

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => (err ? reject(err) : resolve()))
      })
    }
    await Promise.all(workers.map((w) => w.close()))
    await prisma.$disconnect()
    redis.disconnect()
    clearTimeout(shutdownTimeout)
    logger.info('Shutdown complete')
    process.exit(0)
  } catch (err) {
    logger.error('Error during shutdown', { error: (err as Error).message })
    clearTimeout(shutdownTimeout)
    process.exit(1)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
