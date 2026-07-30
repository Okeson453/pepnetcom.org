import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/modules/auth/auth.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/modules/auth/auth.service')>()
  return { ...actual, verifyToken: vi.fn() }
})
vi.mock('../../src/modules/signals/signals.repository', () => ({
  signalsRepository: { findActiveSubscription: vi.fn() },
}))

import { app } from '../../src/http/app'
import { verifyToken } from '../../src/modules/auth/auth.service'
import { signalsRepository } from '../../src/modules/signals/signals.repository'

describe('GET /api/signals/live — subscription entitlement (paywall-bypass fix)', () => {
  it('rejects a CLIENT with no active signal subscription', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      success: true,
      data: { id: 'client-1', role: 'CLIENT' } as any,
    })
    vi.mocked(signalsRepository.findActiveSubscription).mockResolvedValue(null)

    const res = await app.request('/api/signals/live?token=fake-token')
    expect(res.status).toBe(403)
  })

  it('admits a CLIENT with an active signal subscription', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      success: true,
      data: { id: 'client-1', role: 'CLIENT' } as any,
    })
    vi.mocked(signalsRepository.findActiveSubscription).mockResolvedValue({ id: 'sub-1' } as any)

    const res = await app.request('/api/signals/live?token=fake-token')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/event-stream')
  })

  it('admits ADMIN without checking for a subscription at all', async () => {
    vi.mocked(verifyToken).mockResolvedValue({
      success: true,
      data: { id: 'admin-1', role: 'ADMIN' } as any,
    })
    vi.mocked(signalsRepository.findActiveSubscription).mockResolvedValue(null)

    const res = await app.request('/api/signals/live?token=fake-token')
    expect(res.status).toBe(200)
    expect(signalsRepository.findActiveSubscription).not.toHaveBeenCalled()
  })

  it('rejects a missing token before ever checking subscription status', async () => {
    const res = await app.request('/api/signals/live')
    expect(res.status).toBe(401)
  })
})
