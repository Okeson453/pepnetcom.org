import type { Strategy, StrategyPurchase } from '@prisma/client'

export interface StrategyWithPurchase extends Strategy {
  isPurchased?: boolean
  purchaseDate?: Date
}

export interface SalesReport {
  strategyId: string
  title: string
  totalSales: number
  totalRevenue: number
  uniqueBuyers: number
}
