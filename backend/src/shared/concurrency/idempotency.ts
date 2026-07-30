import { redis } from '../cache/redis-client'

const TTL_SECONDS = 24 * 60 * 60 // 24h, per the audit's recommendation

/**
 * §3.5: client-side double-submission (double-click "Pay Now", a retried
 * mobile network request) wasn't guarded at the API boundary. Accepts a
 * client-generated Idempotency-Key, scoped per-user and per-operation, and
 * replays the cached response instead of re-running the handler (which,
 * for payments.initiate, would otherwise open a second gateway checkout
 * session for the same purchase).
 */
export async function withIdempotencyKey<T>(
  scope: string,
  userId: string,
  idempotencyKey: string | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  if (!idempotencyKey) {
    return fn()
  }
  const key = `idempotency:${scope}:${userId}:${idempotencyKey}`
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached) as T
  }
  const result = await fn()
  await redis.set(key, JSON.stringify(result), 'EX', TTL_SECONDS)
  return result
}
