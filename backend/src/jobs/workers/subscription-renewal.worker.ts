import { Worker } from 'bullmq'
import { redis } from '../../shared/cache/redis-client'
import { logger } from '../../shared/logging/logger'
import { prisma } from '../../shared/db/prisma-client'

/**
 * IMPORTANT — this does not (and, as shipped, cannot honestly) charge the customer.
 *
 * There is no subscription checkout/creation flow anywhere in this codebase that
 * captures a reusable, off-session payment authorization (e.g. a Paystack
 * `authorization_code`, a Stripe `payment_method` on a Customer, or a Flutterwave
 * tokenized card). Without one of those, there is nothing to charge on renewal —
 * building a real auto-charge here would mean inventing an authorization that was
 * never actually granted.
 *
 * Per the audit's own accepted alternative ("...or explicitly disable auto-renew
 * billing claims until it's implemented"): this worker no longer silently extends
 * `endDate` for free (the previous behavior — a real revenue leak). Instead, an
 * auto-renew subscription that reaches its end date without a working charge path
 * is left to expire and is marked EXPIRED, with a clear error log so it's visible
 * to operators/billing, rather than quietly granting free service.
 *
 * To close this properly: add a subscription checkout flow that stores a reusable
 * gateway authorization on the Subscription (e.g. `authorizationCode`), then swap
 * the `logger.error(...)` block below for a real `gateway.chargeSubscription(...)`
 * call and only extend `endDate` on confirmed success.
 */
export const subscriptionRenewalWorker = new Worker(
  'subscription-renewal',
  async (job) => {
    const { subscriptionId } = job.data
    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } })
    if (!sub || sub.status !== 'ACTIVE' || !sub.autoRenew) {
      return
    }

    if (sub.endDate > new Date()) {
      // Not actually due yet (queued a few days ahead by the expiry-check worker) — skip.
      logger.info('Subscription renewal not yet due, skipping', { subscriptionId })
      return
    }

    logger.error('Subscription auto-renew charge not implemented — no stored payment authorization to charge; marking EXPIRED instead of extending for free', {
      subscriptionId,
      plan: sub.plan,
      amount: sub.amount.toString(),
      currency: sub.currency,
    })

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'EXPIRED' },
    })
  },
  { connection: redis },
)

// Persist + alert once a job exhausts its retries, instead of letting it
// vanish after a single log line (see dlq-handler.ts).
import { handleDeadLetter } from '../dead-letter/dlq-handler'
subscriptionRenewalWorker.on('failed', (job, err) => {
  if (job) handleDeadLetter(job, err as Error)
})
