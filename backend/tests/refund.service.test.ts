import { describe, it, expect, vi } from 'vitest'
import { RefundService } from '../src/modules/payments/refund.service'
import { PaymentsRepository } from '../src/modules/payments/payments.repository'
import { ForbiddenError, ValidationError, NotFoundError } from '../src/shared/errors/domain-error'

const mockRepo = {
  findPaymentById: vi.fn(),
  findRefunds: vi.fn(),
  createRefund: vi.fn(),
} as unknown as PaymentsRepository

describe('RefundService.requestRefund — ownership & status (IDOR fix)', () => {
  const service = new RefundService(mockRepo)

  it('rejects a refund request for a payment that does not exist', async () => {
    mockRepo.findPaymentById = vi.fn().mockResolvedValue(null)
    const result = await service.requestRefund('missing', 'user-1', 'not received')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(NotFoundError)
  })

  it("rejects a refund request for another user's payment", async () => {
    mockRepo.findPaymentById = vi.fn().mockResolvedValue({
      id: 'p1',
      userId: 'someone-else',
      amount: 5000,
      status: 'SUCCESS',
    })
    const result = await service.requestRefund('p1', 'attacker', 'gimme money')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ForbiddenError)
    expect(mockRepo.createRefund).not.toHaveBeenCalled()
  })

  it('rejects a refund request for a payment that never succeeded', async () => {
    mockRepo.findPaymentById = vi.fn().mockResolvedValue({
      id: 'p1',
      userId: 'user-1',
      amount: 5000,
      status: 'PENDING',
    })
    const result = await service.requestRefund('p1', 'user-1', 'changed my mind')
    expect(result.success).toBe(false)
    expect(result.error).toBeInstanceOf(ValidationError)
    expect(mockRepo.createRefund).not.toHaveBeenCalled()
  })

  it("allows the payment's own owner to request a refund on a successful payment", async () => {
    mockRepo.findPaymentById = vi.fn().mockResolvedValue({
      id: 'p1',
      userId: 'user-1',
      amount: 5000,
      status: 'SUCCESS',
    })
    mockRepo.findRefunds = vi.fn().mockResolvedValue([])
    mockRepo.createRefund = vi.fn().mockResolvedValue({ id: 'r1', amount: 5000, status: 'PENDING' })

    const result = await service.requestRefund('p1', 'user-1', 'not as described')
    expect(result.success).toBe(true)
    expect(mockRepo.createRefund).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 5000, reason: 'not as described' }),
    )
  })
})
