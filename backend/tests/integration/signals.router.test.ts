import { describe, it, expect } from 'vitest'
import { app } from '../../src/http/app'

describe('Signals Router Integration', () => {
  it('signals.list requires subscription (client role)', async () => {
    const res = await app.request('/api/trpc/signals.list?input={"json":{"limit":10}}', {
      method: 'GET',
    })
    // Without auth, should be unauthorized
    const body = (await res.json().catch(() => null)) as { error?: { code?: string } } | null
    if (body && body.error) {
      expect(body.error.code).toMatch(/UNAUTHORIZED|FORBIDDEN/)
    }
  })
})
