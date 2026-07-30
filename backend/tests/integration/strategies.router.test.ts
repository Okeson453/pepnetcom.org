import { describe, it, expect } from 'vitest'
import { app } from '../../src/http/app'

describe('Strategies Router Integration', () => {
  it('strategies.list is public', async () => {
    const res = await app.request('/api/trpc/strategies.list?input={"json":{"limit":10}}', {
      method: 'GET',
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { result?: unknown }
    expect(body.result).toBeDefined()
  })
})
