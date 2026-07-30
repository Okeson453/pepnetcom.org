import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'
import { redis } from '../cache/redis-client'
import { ForbiddenError } from '../errors/domain-error'
import { env } from '../../config/env'

interface RateLimitOptions {
  key: string
  limit: number
  windowSeconds: number
}

export async function rateLimit(options: RateLimitOptions): Promise<void> {
  const { key, limit, windowSeconds } = options
  const current = await redis.incr(key)
  if (current === 1) {
    await redis.expire(key, windowSeconds)
  }
  if (current > limit) {
    const ttl = await redis.ttl(key)
    throw new ForbiddenError(`Rate limit exceeded. Retry in ${ttl} seconds.`)
  }
}

export function rateLimitMiddleware(opts: Omit<RateLimitOptions, 'key'> & { keyPrefix: string }) {
  return async (keySuffix: string) => {
    await rateLimit({ key: `${opts.keyPrefix}:${keySuffix}`, limit: opts.limit, windowSeconds: opts.windowSeconds })
  }
}

/**
 * Resolve the client IP without blindly trusting client-suppliable headers.
 * - If TRUST_PROXY is not set, every request is behind an untrusted/no proxy:
 *   use the raw socket peer address, so X-Forwarded-For can't be spoofed to
 *   get a fresh rate-limit bucket per request.
 * - If TRUST_PROXY is set, we're known to be behind a real reverse proxy/LB.
 *   Prefer platform-native headers that proxies set authoritatively and that
 *   clients can't override (Fly-Client-IP, CF-Connecting-IP, ALB's X-Forwarded-For
 *   position), falling back to the first X-Forwarded-For entry.
 */
export function resolveClientIp(c: Context): string {
  if (env.TRUST_PROXY) {
    const platformIp =
      c.req.header('fly-client-ip') ?? c.req.header('cf-connecting-ip') ?? c.req.header('x-real-ip')
    if (platformIp) return platformIp
    const xff = c.req.header('x-forwarded-for')
    if (xff) return xff.split(',')[0]?.trim() ?? 'unknown'
    return 'unknown'
  }

  try {
    const info = getConnInfo(c)
    return info.remote.address ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Global per-IP rate limiter, applied to every request in app.ts.
 * Defaults to 300 requests/minute per client IP; override for stricter
 * limits on sensitive endpoints (e.g. auth) by calling rateLimit() directly.
 */
export function apiRateLimitMiddleware(limit = 300, windowSeconds = 60) {
  return createMiddleware(async (c, next) => {
    const ip = resolveClientIp(c)
    await rateLimit({ key: `ratelimit:global:${ip}`, limit, windowSeconds })
    await next()
  })
}
