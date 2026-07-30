import { strategiesRepository } from './strategies.repository'
import { Ok, Err } from '../../shared/result'
import { NotFoundError, ConflictError } from '../../shared/errors/domain-error'
import type { Result } from '../../shared/result'
import type { StrategyPurchase } from '@prisma/client'

export class StrategySalesService {
  constructor(private repo = strategiesRepository) {}

  /**
   * Creates a PENDING purchase record and returns it — this does NOT grant
   * access. §9.1 of the audit: the previous version created the purchase row
   * directly, which was itself the full access grant, so any authenticated
   * client could get a paid strategy for $0. Access is now only flipped on
   * in payments.service.ts::verifyPayment, mirroring how order.status flips
   * to PAID only inside that same verified transaction.
   */
  async purchaseStrategy(strategyId: string, userId: string): Promise<Result<StrategyPurchase, NotFoundError | ConflictError>> {
    const strategy = await this.repo.findById(strategyId)
    if (!strategy || !strategy.isActive) {
      return Err(new NotFoundError('Strategy', strategyId))
    }
    const active = await this.repo.findActivePurchase(userId, strategyId)
    if (active) {
      return Err(new ConflictError('You have already purchased this strategy'))
    }
    // Reuse an existing PENDING attempt instead of accumulating duplicate rows
    // on retry (declined card, abandoned checkout) — same principle as §3.2's
    // fix for Payment/Order.
    const pending = await this.repo.findPendingPurchase(userId, strategyId)
    if (pending) {
      return Ok(pending)
    }
    const purchase = await this.repo.createPurchase({
      strategy: { connect: { id: strategyId } },
      user: { connect: { id: userId } },
      amount: strategy.price,
      currency: strategy.currency,
      status: 'PENDING',
    })
    return Ok(purchase)
  }

  async getMyPurchases(userId: string): Promise<StrategyPurchase[]> {
    return this.repo.findPurchasesByUser(userId)
  }

  async getSalesReport(): Promise<any[]> {
    const raw = await this.repo.getSalesReport()
    const strategies = await this.repo.findMany({ where: { isActive: true } })
    return raw.map((r) => {
      const strategy = strategies.find((s) => s.id === r.strategyId)
      return {
        strategyId: r.strategyId,
        title: strategy?.title ?? 'Unknown',
        totalSales: r._count.userId,
        totalRevenue: r._sum.amount ?? 0,
        uniqueBuyers: r._count.userId,
      }
    })
  }
}

export const strategySalesService = new StrategySalesService()
