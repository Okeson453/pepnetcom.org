import { describe, it, expect } from 'vitest'
import { app } from '../src/http/app'

describe('GET /api/health', () => {
  it('returns ok when postgres and redis are reachable', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)

    const body = (await res.json()) as {
      status: string
      service: string
      checks: { database: boolean; redis: boolean }
      timestamp: string
    }
    expect(body.status).toBe('ok')
    expect(body.service).toBe('pepnetcom-backend')
    expect(body.checks.database).toBe(true)
    expect(body.checks.redis).toBe(true)
    expect(body.timestamp).toBeDefined()
  })
})
