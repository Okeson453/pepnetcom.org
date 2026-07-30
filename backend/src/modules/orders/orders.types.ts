import type { Order, OrderStatusHistory, OrderAssignment } from '@prisma/client'

export interface OrderWithDetails extends Order {
  statusHistory?: OrderStatusHistory[]
  assignment?: OrderAssignment | null
}

export interface OrderTimelineItem {
  status: string
  notes: string | null
  createdAt: Date
  createdBy: string | null
}
