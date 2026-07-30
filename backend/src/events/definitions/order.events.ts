export interface OrderPaidEvent {
  type: 'OrderPaid'
  orderId: string
  paymentId: string
  amount: number
  currency: string
  paidAt: string
}

export interface OrderAssignedEvent {
  type: 'OrderAssigned'
  orderId: string
  staffId: string
  assignedBy: string
  assignedAt: string
}

export interface OrderDeliveredEvent {
  type: 'OrderDelivered'
  orderId: string
  deliveredBy: string
  deliveredAt: string
}

export type OrderEvent = OrderPaidEvent | OrderAssignedEvent | OrderDeliveredEvent
