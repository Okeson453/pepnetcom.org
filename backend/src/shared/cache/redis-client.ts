import { Redis } from 'ioredis'
import { env } from '../../config/env'

declare global {
  var __redis: Redis | undefined
}

export const redis = global.__redis ?? new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})

if (env.NODE_ENV !== 'production') {
  global.__redis = redis
}

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

redis.on('connect', () => {
  console.log('Redis connected')
})
