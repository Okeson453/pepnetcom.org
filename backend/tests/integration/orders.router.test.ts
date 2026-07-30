import { describe, it, expect } from 'vitest'
import { app } from '../../src/http/app'

describe('Orders Router Integration', () => {
  it('orders.list requires authentication', async () => {
    const res = await app.request('/api/trpc/orders.list', {
      method: 'GET',
    })
    // Should fail auth — tRPC returns 200 with error in body or 401
    const body = (await res.json().catch(() => null)) as { error?: unknown } | null
    if (body) {
      expect(body.error).toBeDefined()
    }
  })
})
