import type { Context as HonoContext } from 'hono'
import { prisma } from '../shared/db/prisma-client'
import { redis } from '../shared/cache/redis-client'
import { verifyToken } from '../modules/auth/auth.service'
import { resolveClientIp } from '../shared/rate-limit/rate-limiter'
import type { User } from '@prisma/client'

export interface Context {
  prisma: typeof prisma
  redis: typeof redis
  req: Request
  ip: string
  user: User | null
}

export async function createTRPCContext({ req, honoCtx }: { req: Request; honoCtx?: HonoContext }): Promise<Context> {
  const authHeader = req.headers.get('authorization')
  let user: User | null = null

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    try {
      const result = await verifyToken(token)
      if (result.success) {
        user = result.data
      }
    } catch {
      user = null
    }
  }

  // Reuses the same spoof-resistant IP resolution as the global rate limiter
  // (honors TRUST_PROXY, never trusts client-suppliable headers when unset).
  const ip = honoCtx ? resolveClientIp(honoCtx) : 'unknown'

  return {
    prisma,
    redis,
    req,
    ip,
    user,
  }
}
