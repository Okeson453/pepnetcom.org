import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UploadsService } from '../src/modules/uploads/uploads.service'
import { ordersRepository } from '../src/modules/orders/orders.repository'
import { ForbiddenError, ValidationError } from '../src/shared/errors/domain-error'

vi.mock('../src/integrations/storage/s3.adapter', () => ({
  s3Adapter: { getUploadUrl: vi.fn().mockResolvedValue('https://storage.example.com/signed-put-url') },
}))
import { s3Adapter } from '../src/integrations/storage/s3.adapter'

const mockOrderRepo = {
  findById: vi.fn(),
} as unknown as typeof ordersRepository

describe('UploadsService.getUploadUrl', () => {
  const service = new UploadsService(mockOrderRepo)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects a contentType outside the scope whitelist', async () => {
    const result = await service.getUploadUrl(
      { scope: 'cms-media', fileName: 'x.exe', contentType: 'application/x-msdownload', size: 100 },
      'admin-1',
      'ADMIN',
    )
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ValidationError)
    expect(s3Adapter.getUploadUrl).not.toHaveBeenCalled()
  })

  it('accepts a whitelisted contentType for the given scope', async () => {
    const result = await service.getUploadUrl(
      { scope: 'cms-media', fileName: 'logo.png', contentType: 'image/png', size: 1000 },
      'admin-1',
      'ADMIN',
    )
    expect(result.success).toBe(true)
    expect(s3Adapter.getUploadUrl).toHaveBeenCalled()
  })

  it('threads the declared contentType and size through to the storage adapter (so they get bound into the signature)', async () => {
    await service.getUploadUrl(
      { scope: 'cms-media', fileName: 'logo.png', contentType: 'image/png', size: 12345 },
      'admin-1',
      'ADMIN',
    )
    expect(s3Adapter.getUploadUrl).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Number),
      'image/png',
      12345,
    )
  })

  it('rejects cms-media uploads from a non-admin', async () => {
    const result = await service.getUploadUrl(
      { scope: 'cms-media', fileName: 'logo.png', contentType: 'image/png', size: 1000 },
      'client-1',
      'CLIENT',
    )
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
  })

  it('rejects marketing-deliverable uploads from a non-admin', async () => {
    const result = await service.getUploadUrl(
      { scope: 'marketing-deliverable', fileName: 'brief.pdf', contentType: 'application/pdf', size: 1000 },
      'client-1',
      'CLIENT',
    )
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
  })

  describe('siwes-report scope', () => {
    it('requires a parentId (orderId)', async () => {
      const result = await service.getUploadUrl(
        { scope: 'siwes-report', fileName: 'report.pdf', contentType: 'application/pdf', size: 1000 },
        'writer-1',
        'WRITER',
      )
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(ValidationError)
    })

    it('rejects an order that is not a SIWES order', async () => {
      mockOrderRepo.findById = vi.fn().mockResolvedValue({ id: 'o1', serviceType: 'ACADEMIC', assignment: null })
      const result = await service.getUploadUrl(
        { scope: 'siwes-report', fileName: 'report.pdf', contentType: 'application/pdf', size: 1000, parentId: 'o1' },
        'writer-1',
        'WRITER',
      )
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(ValidationError)
    })

    it('rejects a writer who is not the assigned staff on the order', async () => {
      mockOrderRepo.findById = vi.fn().mockResolvedValue({
        id: 'o1',
        serviceType: 'SIWES',
        assignment: { staffId: 'other-writer' },
      })
      const result = await service.getUploadUrl(
        { scope: 'siwes-report', fileName: 'report.pdf', contentType: 'application/pdf', size: 1000, parentId: 'o1' },
        'writer-1',
        'WRITER',
      )
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(ForbiddenError)
    })

    it('allows the assigned writer', async () => {
      mockOrderRepo.findById = vi.fn().mockResolvedValue({
        id: 'o1',
        serviceType: 'SIWES',
        assignment: { staffId: 'writer-1' },
      })
      const result = await service.getUploadUrl(
        { scope: 'siwes-report', fileName: 'report.pdf', contentType: 'application/pdf', size: 1000, parentId: 'o1' },
        'writer-1',
        'WRITER',
      )
      expect(result.success).toBe(true)
    })

    it('allows an admin regardless of assignment', async () => {
      mockOrderRepo.findById = vi.fn().mockResolvedValue({
        id: 'o1',
        serviceType: 'SIWES',
        assignment: { staffId: 'some-writer' },
      })
      const result = await service.getUploadUrl(
        { scope: 'siwes-report', fileName: 'report.pdf', contentType: 'application/pdf', size: 1000, parentId: 'o1' },
        'admin-1',
        'ADMIN',
      )
      expect(result.success).toBe(true)
    })
  })

  it('keeps only the file extension from the client-supplied fileName in the generated key (no path traversal)', async () => {
    const result = await service.getUploadUrl(
      { scope: 'cms-media', fileName: '../../etc/passwd.png', contentType: 'image/png', size: 100 },
      'admin-1',
      'ADMIN',
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.key).not.toContain('..')
      expect(result.data.key).not.toContain('etc/passwd')
      expect(result.data.key.endsWith('.png')).toBe(true)
    }
  })
})
