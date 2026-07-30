import { randomUUID } from 'crypto'
import { redis } from '../cache/redis-client'
import { ConflictError } from '../errors/domain-error'

/**
 * Short-lived Redis lock (`SET NX PX`) for critical sections that span an
 * external HTTP call (payment gateway verify/refund) and therefore can't
 * safely be wrapped in a single DB transaction end-to-end — you never want
 * to hold a Postgres row lock across a network round-trip to a PSP.
 *
 * Used by:
 * - payments.service.ts::verifyPayment (§3.3 — webhook vs. client-initiated
 *   verify can race through the pre-transaction idempotency check together)
 * - refund.service.ts::updateStatus (§3.6 — two admins concurrently
 *   approving two different refunds on the same payment)
 */
export async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const token = randomUUID()
  const acquired = await redis.set(key, token, 'PX', ttlMs, 'NX')
  if (!acquired) {
    throw new ConflictError('This resource is already being processed by another request — please retry shortly')
  }
  try {
    return await fn()
  } finally {
    // Only release if we still own the lock (avoids releasing a lock that
    // expired and was re-acquired by someone else while we were running).
    const script = `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`
    await redis.eval(script, 1, key, token)
  }
}
