import type { Order, SiwesOrderDetail } from '@prisma/client'

export interface SiwesOrderWithDetails extends Order {
  siwesDetail: SiwesOrderDetail | null
}
