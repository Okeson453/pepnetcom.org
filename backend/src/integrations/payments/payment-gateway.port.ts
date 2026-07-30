export interface PaymentGatewayPort {
  name: string
  initiatePayment(params: {
    amount: number
    currency: string
    email: string
    reference: string
    metadata?: Record<string, unknown>
  }): Promise<{ authorizationUrl: string; gatewayRef: string }>

  verifyPayment(gatewayRef: string): Promise<{
    success: boolean
    amount: number
    currency: string
    paidAt?: Date
    metadata?: Record<string, unknown>
  }>

  refundPayment(gatewayRef: string, amount?: number): Promise<{
    success: boolean
    refundRef?: string
  }>
}

export type GatewayName = 'paystack' | 'flutterwave' | 'stripe'
