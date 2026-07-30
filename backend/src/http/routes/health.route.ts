import { Hono } from 'hono'
import { prisma } from '../../shared/db/prisma-client'
import { redis } from '../../shared/cache/redis-client'

const health = new Hono()

health.get('/api/health', async (c) => {
  const checks = {
    database: false,
    redis: false,
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch {
    checks.database = false
  }

  try {
    await redis.ping()
    checks.redis = true
  } catch {
    checks.redis = false
  }

  const healthy = checks.database && checks.redis

  return c.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'pepnetcom-backend',
      checks,
    },
    healthy ? 200 : 503
  )
})

export { health }
