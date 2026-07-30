import { PrismaClient } from '@prisma/client'
import { env } from '../../config/env'

declare global {
  var __prisma: PrismaClient | undefined
}

// §5.3 of the audit: Prisma's default pool size is `num_physical_cpus * 2 + 1`
// *per instance*. That's invisible and easy to forget about — run 6 web
// replicas + 3 worker replicas on an 8 vCPU box and you're suddenly asking
// Postgres for ~150 connections before any pooler or PgBouncer is in the
// picture, against a default Postgres max_connections of 100. Set it
// explicitly via DATABASE_CONNECTION_LIMIT (per-instance, so
// replicas * this value is the real ceiling to size max_connections against)
// instead of leaving it implicit.
function withPoolParams(url: string): string {
  const parsed = new URL(url)
  if (!parsed.searchParams.has('connection_limit')) {
    parsed.searchParams.set('connection_limit', String(env.DATABASE_CONNECTION_LIMIT))
  }
  if (!parsed.searchParams.has('pool_timeout')) {
    parsed.searchParams.set('pool_timeout', String(env.DATABASE_POOL_TIMEOUT_SECONDS))
  }
  return parsed.toString()
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    datasources: { db: { url: withPoolParams(env.DATABASE_URL) } },
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}
