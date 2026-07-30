import { beforeAll, afterAll } from 'vitest'
import { prisma } from '../src/shared/db/prisma-client'
import { redis } from '../src/shared/cache/redis-client'

beforeAll(async () => {
  await prisma.$connect()
  await redis.ping()
})

afterAll(async () => {
  await prisma.$disconnect()
  await redis.quit()
})
