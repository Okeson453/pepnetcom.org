import { describe, it, expect, vi } from 'vitest'
import { SignalsService } from '../src/modules/signals/signals.service'
import { SignalsRepository } from '../src/modules/signals/signals.repository'
import { SignalBroadcastService } from '../src/modules/signals/signal-broadcast.service'
import { SignalPerformanceService } from '../src/modules/signals/signal-performance.service'
import { SubscriberManagementService } from '../src/modules/signals/subscriber-management.service'

const mockRepo = {
  findById: vi.fn(),
  create: vi.fn(),
  closeSignal: vi.fn(),
  findMany: vi.fn().mockResolvedValue([]),
} as unknown as SignalsRepository

const mockBroadcast = {
  broadcastSignal: vi.fn(),
  broadcastSignalClose: vi.fn(),
} as unknown as SignalBroadcastService

const mockPerf = {
  calculateStats: vi.fn().mockResolvedValue({ data: { winRate: 65 } }),
} as unknown as SignalPerformanceService

const mockSub = {
  listSubscribers: vi.fn().mockResolvedValue([]),
  updateStatus: vi.fn(),
} as unknown as SubscriberManagementService

describe('SignalsService', () => {
  const service = new SignalsService(mockRepo, mockBroadcast, mockPerf, mockSub)

  it('create broadcasts new signal', async () => {
    mockRepo.create = vi.fn().mockResolvedValue({
      id: 'sig-1',
      symbol: 'EURUSD',
      status: 'ACTIVE',
    })
    const result = await service.create({
      symbol: 'EURUSD',
      type: 'FOREX',
      direction: 'BUY',
    })
    expect(mockBroadcast.broadcastSignal).toHaveBeenCalled()
    expect(result.symbol).toBe('EURUSD')
  })

  it('close broadcasts signal close', async () => {
    mockRepo.findById = vi.fn().mockResolvedValue({ id: 'sig-1', status: 'ACTIVE' })
    mockRepo.closeSignal = vi.fn().mockResolvedValue({ id: 'sig-1', status: 'CLOSED', result: 'WIN' })
    const result = await service.close('sig-1', 'WIN')
    expect(result.success).toBe(true)
    expect(mockBroadcast.broadcastSignalClose).toHaveBeenCalled()
  })
})
