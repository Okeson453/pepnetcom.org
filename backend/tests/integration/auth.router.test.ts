import { describe, it, expect } from 'vitest'
import { app } from '../../src/http/app'

describe('Auth Router Integration', () => {
  it('register rejects invalid email', async () => {
    const res = await app.request('/api/trpc/auth.register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: { email: 'invalid', password: 'short', firstName: '', lastName: '', role: 'CLIENT' },
      }),
    })
    expect(res.status).toBe(400)
  })

  it('login rejects unknown user', async () => {
    const res = await app.request('/api/trpc/auth.login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        json: { email: 'nobody@example.com', password: 'Password123!' },
      }),
    })
    expect(res.status).toBe(401)
  })
})
