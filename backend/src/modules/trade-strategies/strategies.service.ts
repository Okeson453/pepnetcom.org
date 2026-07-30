import { strategiesRepository } from './strategies.repository'
import { strategySalesService } from './strategy-sales.service'
import { paymentsService } from '../payments/payments.service'
import { Ok, Err } from '../../shared/result'
import { NotFoundError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { Strategy } from '@prisma/client'
import type { GatewayName } from '../../integrations/payments/payment-gateway.port'

export class StrategiesService {
  constructor(
    private repo = strategiesRepository,
    private salesSvc = strategySalesService,
  ) {}

  async list(input: any): Promise<{ items: Strategy[]; nextCursor?: string; hasMore: boolean }> {
    const where: any = { isActive: true }
    if (input.category) where.category = input.category
    if (input.difficulty) where.difficulty = input.difficulty
    if (input.search) {
      where.OR = [
        { title: { contains: input.search, mode: 'insensitive' } },
        { description: { contains: input.search, mode: 'insensitive' } },
      ]
    }

    const take = (input.limit ?? 20) + 1
    const strategies = await this.repo.findMany({
      where,
      take,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    })

    const hasMore = strategies.length > (input.limit ?? 20)
    const items = hasMore ? strategies.slice(0, input.limit ?? 20) : strategies
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

    return { items, nextCursor, hasMore }
  }

  async getById(id: string, requestingUserId?: string, requestingUserRole?: string): Promise<Result<Strategy, NotFoundError>> {
    const strategy = await this.repo.findById(id)
    if (!strategy || !strategy.isActive) {
      return Err(new NotFoundError('Strategy', id))
    }
    const isAdmin = requestingUserRole === 'ADMIN'
    const hasActivePurchase =
      !isAdmin && requestingUserId ? Boolean(await this.repo.findActivePurchase(requestingUserId, id)) : false
    if (isAdmin || hasActivePurchase) {
      return Ok(strategy)
    }
    // Not purchased (or anonymous): strip the paid content, keep the
    // marketing/preview fields. Otherwise the §9.1 paywall fix is pointless —
    // gating *creation* of access doesn't matter if the content itself is
    // already served by this same public query.
    return Ok({ ...strategy, content: '', downloadUrl: null })
  }

  async create(input: any): Promise<Strategy> {
    return this.repo.create({
      title: input.title,
      slug: input.slug,
      description: input.description,
      content: input.content,
      price: input.price,
      currency: input.currency,
      category: input.category,
      difficulty: input.difficulty,
      downloadUrl: input.downloadUrl,
      previewUrl: input.previewUrl,
    })
  }

  async update(id: string, input: any): Promise<Result<Strategy, NotFoundError>> {
    const strategy = await this.repo.findById(id)
    if (!strategy) {
      return Err(new NotFoundError('Strategy', id))
    }
    const updated = await this.repo.update(id, input)
    return Ok(updated)
  }

  async delete(id: string): Promise<Result<Strategy, NotFoundError>> {
    const strategy = await this.repo.findById(id)
    if (!strategy) {
      return Err(new NotFoundError('Strategy', id))
    }
    await this.repo.update(id, { isActive: false })
    return Ok(strategy)
  }

  async purchase(
    strategyId: string,
    userId: string,
    gateway: GatewayName,
    email: string,
  ): Promise<Result<{ authorizationUrl: string; paymentId: string; strategyPurchaseId: string }, any>> {
    const created = await this.salesSvc.purchaseStrategy(strategyId, userId)
    if (!created.success) {
      return created
    }
    const session = await paymentsService.initiateForStrategyPurchase(created.data.id, userId, gateway, email)
    if (!session.success) {
      return session
    }
    return Ok({ ...session.data, strategyPurchaseId: created.data.id })
  }

  async myPurchases(userId: string): Promise<any[]> {
    return this.salesSvc.getMyPurchases(userId)
  }

  async salesReport(): Promise<any[]> {
    return this.salesSvc.getSalesReport()
  }
}

export const strategiesService = new StrategiesService()
