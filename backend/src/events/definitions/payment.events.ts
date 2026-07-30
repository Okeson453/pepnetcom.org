export interface PaymentSucceededEvent {
  type: 'PaymentSucceeded'
  paymentId: string
  orderId?: string
  amount: number
  currency: string
  gateway: string
  paidAt: string
}

export interface RefundIssuedEvent {
  type: 'RefundIssued'
  refundId: string
  paymentId: string
  amount: number
  issuedAt: string
}

export type PaymentEvent = PaymentSucceededEvent | RefundIssuedEvent
