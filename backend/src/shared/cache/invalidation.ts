import { redis } from './redis-client'

export async function invalidatePattern(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

export async function invalidateKeys(...keys: string[]): Promise<void> {
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
