import { describe, it, expect, vi } from 'vitest'
import { OrdersService } from '../src/modules/orders/orders.service'
import { OrdersRepository } from '../src/modules/orders/orders.repository'
import { OrderAssignmentService } from '../src/modules/orders/order-assignment.service'
import { ValidationError } from '../src/shared/errors/domain-error'

const mockRepo = {
  findById: vi.fn(),
  updateStatus: vi.fn(),
  create: vi.fn(),
  findMany: vi.fn().mockResolvedValue([]),
} as unknown as OrdersRepository

const mockAssignment = {
  assignStaff: vi.fn(),
} as unknown as OrderAssignmentService

describe('OrdersService', () => {
  const service = new OrdersService(mockRepo, mockAssignment)

  it('updateStatus validates state machine transitions', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({ id: '1', status: 'COMPLETED' })
    const result = await service.updateStatus(
      { id: '1', status: 'DRAFT' },
      'user-1'
    )
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ValidationError)
  })

  it('cancel rejects already-assigned orders', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({
      id: '1',
      status: 'ASSIGNED',
      clientId: 'client-1',
    })
    const result = await service.cancel(
      { id: '1' },
      'client-1',
      'CLIENT'
    )
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ValidationError)
  })
})
