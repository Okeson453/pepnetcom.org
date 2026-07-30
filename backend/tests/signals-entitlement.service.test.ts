import { describe, it, expect, vi } from 'vitest'
import { SignalsService } from '../src/modules/signals/signals.service'
import { SignalsRepository } from '../src/modules/signals/signals.repository'
import { ForbiddenError } from '../src/shared/errors/domain-error'

const mockRepo = {
  findById: vi.fn(),
  findMany: vi.fn().mockResolvedValue([]),
  findActiveSubscription: vi.fn(),
} as unknown as SignalsRepository

const noop = {} as any

describe('SignalsService — subscription entitlement gate (paywall-bypass fix)', () => {
  const service = new SignalsService(mockRepo, noop, noop, noop)

  it('rejects list() for a CLIENT with no active subscription', async () => {
    mockRepo.findActiveSubscription = vi.fn().mockResolvedValue(null)
    const result = await service.list({}, 'client-1', 'CLIENT')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
    expect(mockRepo.findMany).not.toHaveBeenCalled()
  })

  it('allows list() for a CLIENT with an active subscription', async () => {
    mockRepo.findActiveSubscription = vi.fn().mockResolvedValue({ id: 'sub-1', status: 'ACTIVE' })
    mockRepo.findMany = vi.fn().mockResolvedValue([{ id: 'sig-1' }])
    const result = await service.list({}, 'client-1', 'CLIENT')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.items).toHaveLength(1)
  })

  it('always allows list() for ADMIN, subscription or not', async () => {
    mockRepo.findActiveSubscription = vi.fn().mockResolvedValue(null)
    mockRepo.findMany = vi.fn().mockResolvedValue([])
    const result = await service.list({}, 'admin-1', 'ADMIN')
    expect(result.success).toBe(true)
    expect(mockRepo.findActiveSubscription).not.toHaveBeenCalled()
  })

  it('rejects getById() for an unsubscribed CLIENT without even looking up the signal', async () => {
    mockRepo.findActiveSubscription = vi.fn().mockResolvedValue(null)
    const result = await service.getById('sig-1', 'client-1', 'CLIENT')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
    expect(mockRepo.findById).not.toHaveBeenCalled()
  })

  it('rejects history() for an unsubscribed CLIENT', async () => {
    mockRepo.findActiveSubscription = vi.fn().mockResolvedValue(null)
    const result = await service.history({}, 'client-1', 'CLIENT')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
  })
})
