import { env } from '../../config/env'
import type { PaymentGatewayPort } from './payment-gateway.port'

const GATEWAY_TIMEOUT_MS = 8000

interface PaystackInitializeResponse {
  status: boolean
  message?: string
  data?: { authorization_url: string; reference: string }
}

interface PaystackVerifyResponse {
  status: boolean
  message?: string
  data?: {
    status: string
    amount: number
    currency: string
    paid_at?: string
    metadata?: Record<string, unknown>
  }
}

interface PaystackRefundResponse {
  status: boolean
  data?: { reference: string }
}

export class PaystackAdapter implements PaymentGatewayPort {
  name = 'paystack'
  private baseUrl = 'https://api.paystack.co'
  private secretKey = env.PAYSTACK_SECRET_KEY ?? ''

  async initiatePayment(params: {
    amount: number
    currency: string
    email: string
    reference: string
    metadata?: Record<string, unknown>
  }): Promise<{ authorizationUrl: string; gatewayRef: string }> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key not configured')
    }
    const res = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: Math.round(params.amount * 100), // kobo
        reference: params.reference,
        metadata: params.metadata,
        callback_url: `${env.FRONTEND_URL}/payment/callback`,
      }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    const data = (await res.json()) as PaystackInitializeResponse
    if (!data.status || !data.data) {
      throw new Error(data.message || 'Paystack initialization failed')
    }
    return {
      authorizationUrl: data.data.authorization_url,
      gatewayRef: data.data.reference,
    }
  }

  async verifyPayment(gatewayRef: string): Promise<{
    success: boolean
    amount: number
    currency: string
    paidAt?: Date
    metadata?: Record<string, unknown>
  }> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key not configured')
    }
    const res = await fetch(`${this.baseUrl}/transaction/verify/${gatewayRef}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    const data = (await res.json()) as PaystackVerifyResponse
    if (!data.status || !data.data) {
      return { success: false, amount: 0, currency: 'NGN' }
    }
    const tx = data.data
    return {
      success: tx.status === 'success',
      amount: tx.amount / 100,
      currency: tx.currency,
      paidAt: tx.paid_at ? new Date(tx.paid_at) : undefined,
      metadata: tx.metadata,
    }
  }

  async refundPayment(gatewayRef: string, amount?: number): Promise<{
    success: boolean
    refundRef?: string
  }> {
    if (!this.secretKey) {
      throw new Error('Paystack secret key not configured')
    }
    const res = await fetch(`${this.baseUrl}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: gatewayRef,
        amount: amount ? Math.round(amount * 100) : undefined,
      }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    const data = (await res.json()) as PaystackRefundResponse
    return { success: data.status, refundRef: data.data?.reference }
  }
}

export const paystackAdapter = new PaystackAdapter()
