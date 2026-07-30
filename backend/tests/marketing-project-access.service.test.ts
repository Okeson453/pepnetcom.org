import { describe, it, expect, vi } from 'vitest'
import { MarketingService } from '../src/modules/digital-marketing/marketing.service'
import { NotFoundError, ForbiddenError } from '../src/shared/errors/domain-error'

const mockRepo = {
  findProjectById: vi.fn(),
  findDeliverables: vi.fn(),
} as any

const mockCampaignSvc = { listCampaigns: vi.fn() } as any
const mockReportsSvc = { listReports: vi.fn() } as any

describe('MarketingService — project-scoped list ownership (IDOR fix)', () => {
  const service = new MarketingService(mockRepo, mockCampaignSvc, mockReportsSvc)

  it('rejects listCampaigns for a project that does not exist', async () => {
    mockRepo.findProjectById.mockResolvedValue(null)
    const result = await service.listCampaigns('missing', 'client-1', 'CLIENT')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(NotFoundError)
    expect(mockCampaignSvc.listCampaigns).not.toHaveBeenCalled()
  })

  it("rejects listCampaigns for a client who doesn't own the project", async () => {
    mockRepo.findProjectById.mockResolvedValue({ id: 'p1', clientId: 'someone-else' })
    const result = await service.listCampaigns('p1', 'attacker', 'CLIENT')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
    expect(mockCampaignSvc.listCampaigns).not.toHaveBeenCalled()
  })

  it('allows listCampaigns for the owning client', async () => {
    mockRepo.findProjectById.mockResolvedValue({ id: 'p1', clientId: 'client-1' })
    mockCampaignSvc.listCampaigns.mockResolvedValue([{ id: 'c1' }])
    const result = await service.listCampaigns('p1', 'client-1', 'CLIENT')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toEqual([{ id: 'c1' }])
  })

  it('allows an admin to listCampaigns regardless of clientId', async () => {
    mockRepo.findProjectById.mockResolvedValue({ id: 'p1', clientId: 'some-client' })
    mockCampaignSvc.listCampaigns.mockResolvedValue([])
    const result = await service.listCampaigns('p1', 'admin-1', 'ADMIN')
    expect(result.success).toBe(true)
  })

  it("rejects listReports for a project the client doesn't own", async () => {
    mockRepo.findProjectById.mockResolvedValue({ id: 'p1', clientId: 'someone-else' })
    const result = await service.listReports('p1', 'attacker', 'CLIENT')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
    expect(mockReportsSvc.listReports).not.toHaveBeenCalled()
  })

  it("rejects listDeliverables for a project the client doesn't own", async () => {
    mockRepo.findProjectById.mockResolvedValue({ id: 'p1', clientId: 'someone-else' })
    const result = await service.listDeliverables('p1', 'attacker', 'CLIENT')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
    expect(mockRepo.findDeliverables).not.toHaveBeenCalled()
  })

  it('allows listDeliverables for the owning client', async () => {
    mockRepo.findProjectById.mockResolvedValue({ id: 'p1', clientId: 'client-1' })
    mockRepo.findDeliverables.mockResolvedValue([{ id: 'd1' }])
    const result = await service.listDeliverables('p1', 'client-1', 'CLIENT')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toEqual([{ id: 'd1' }])
  })
})
