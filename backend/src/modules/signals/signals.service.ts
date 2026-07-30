import { signalsRepository } from './signals.repository'
import { signalBroadcastService } from './signal-broadcast.service'
import { signalPerformanceService } from './signal-performance.service'
import { subscriberManagementService } from './subscriber-management.service'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ForbiddenError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Signal } from '@prisma/client'
import type { SignalPlanKey } from './signals.schema'
import type { GatewayName } from '../../integrations/payments/payment-gateway.port'

export class SignalsService {
  constructor(
    private repo = signalsRepository,
    private broadcastSvc = signalBroadcastService,
    private perfSvc = signalPerformanceService,
    private subSvc = subscriberManagementService,
  ) {}

  // list/getById/history are the actual paid product here — signals.subscribers.subscribe
  // exists specifically to gate them behind an ACTIVE SignalSubscription, but
  // none of the three previously checked for one: any authenticated CLIENT
  // could read the entire signal feed (entries, stops, take-profits) for
  // free. Admins bypass this — they're the ones publishing the signals.
  private async assertEntitled(userId: string, userRole: string): Promise<Result<true, ForbiddenError>> {
    if (userRole === 'ADMIN') return Ok(true)
    const active = await this.repo.findActiveSubscription(userId)
    if (!active) {
      return Err(new ForbiddenError('An active signal subscription is required to view signals'))
    }
    return Ok(true)
  }

  async list(
    input: any,
    userId: string,
    userRole: string,
  ): Promise<Result<{ items: Signal[]; nextCursor?: string; hasMore: boolean }, ForbiddenError>> {
    const entitled = await this.assertEntitled(userId, userRole)
    if (!entitled.success) return entitled

    const where: any = {}
    if (input.symbol) where.symbol = { contains: input.symbol, mode: 'insensitive' }
    if (input.type) where.type = input.type
    if (input.status) where.status = input.status

    const take = (input.limit ?? 20) + 1
    const signals = await this.repo.findMany({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = signals.length > (input.limit ?? 20)
    const items = hasMore ? signals.slice(0, input.limit ?? 20) : signals
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return Ok({ items, nextCursor, hasMore })
  }

  async getById(id: string, userId: string, userRole: string): Promise<Result<Signal, NotFoundError | ForbiddenError>> {
    const entitled = await this.assertEntitled(userId, userRole)
    if (!entitled.success) return entitled
    const signal = await this.repo.findById(id)
    if (!signal) {
      return Err(new NotFoundError('Signal', id))
    }
    return Ok(signal)
  }

  async create(input: any): Promise<Signal> {
    const signal = await this.repo.create({
      symbol: input.symbol,
      type: input.type,
      direction: input.direction,
      entryPrice: input.entryPrice,
      stopLoss: input.stopLoss,
      takeProfit: input.takeProfit,
      description: input.description,
      analysis: input.analysis,
      status: 'ACTIVE',
    })
    await this.broadcastSvc.broadcastSignal(signal)
    return signal
  }

  async close(id: string, result: string): Promise<Result<Signal, NotFoundError>> {
    const signal = await this.repo.findById(id)
    if (!signal) {
      return Err(new NotFoundError('Signal', id))
    }
    const updated = await this.repo.closeSignal(id, result)
    await this.broadcastSvc.broadcastSignalClose(updated)
    return Ok(updated)
  }

  async history(
    input: any,
    userId: string,
    userRole: string,
  ): Promise<Result<{ items: Signal[]; nextCursor?: string; hasMore: boolean }, ForbiddenError>> {
    return this.list({ ...input, status: 'CLOSED' }, userId, userRole)
  }

  async performanceStats(): Promise<Result<any, never>> {
    return this.perfSvc.calculateStats()
  }

  async listSubscribers(): Promise<any[]> {
    return this.subSvc.listSubscribers()
  }

  async updateSubscriberStatus(id: string, status: string): Promise<Result<any, any>> {
    return this.subSvc.updateStatus(id, status)
  }

  async subscribe(userId: string, plan: SignalPlanKey, gateway: GatewayName, email: string): Promise<Result<any, any>> {
    return this.subSvc.subscribe(userId, plan, gateway, email)
  }
}

export const signalsService = new SignalsService()
