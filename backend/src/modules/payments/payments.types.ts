import type { Payment, Invoice, RefundRequest, Subscription } from '@prisma/client'

export interface PaymentWithOrder extends Payment {
  order?: { id: string; orderNumber: string; status: string } | null
}

export interface GatewayConfig {
  name: string
  isActive: boolean
  config: Record<string, unknown>
}
