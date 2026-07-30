import { env } from '../../config/env'
import type { PaymentGatewayPort } from './payment-gateway.port'

const GATEWAY_TIMEOUT_MS = 8000

interface FlutterwaveInitializeResponse {
  status: string
  message?: string
  data?: { link: string }
}

interface FlutterwaveVerifyResponse {
  status: string
  data?: {
    id: number
    status: string
    amount: number
    currency: string
    created_at?: string
    meta?: Record<string, unknown>
  }
}

interface FlutterwaveRefundResponse {
  status: string
  data?: { id: number }
}

export class FlutterwaveAdapter implements PaymentGatewayPort {
  name = 'flutterwave'
  private baseUrl = 'https://api.flutterwave.com/v3'
  private secretKey = env.FLUTTERWAVE_SECRET_KEY ?? ''

  async initiatePayment(params: {
    amount: number
    currency: string
    email: string
    reference: string
    metadata?: Record<string, unknown>
  }): Promise<{ authorizationUrl: string; gatewayRef: string }> {
    if (!this.secretKey) {
      throw new Error('Flutterwave secret key not configured')
    }
    const res = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: params.reference,
        amount: params.amount,
        currency: params.currency,
        redirect_url: `${env.FRONTEND_URL}/payment/callback`,
        customer: { email: params.email },
        meta: params.metadata,
      }),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    const data = (await res.json()) as FlutterwaveInitializeResponse
    if (data.status !== 'success' || !data.data) {
      throw new Error(data.message || 'Flutterwave initialization failed')
    }
    return {
      authorizationUrl: data.data.link,
      gatewayRef: params.reference,
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
      throw new Error('Flutterwave secret key not configured')
    }
    const res = await fetch(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${gatewayRef}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    const data = (await res.json()) as FlutterwaveVerifyResponse
    if (data.status !== 'success' || !data.data) {
      return { success: false, amount: 0, currency: 'NGN' }
    }
    const tx = data.data
    return {
      success: tx.status === 'successful',
      amount: tx.amount,
      currency: tx.currency,
      paidAt: tx.created_at ? new Date(tx.created_at) : undefined,
      metadata: tx.meta,
    }
  }

  async refundPayment(gatewayRef: string, amount?: number): Promise<{
    success: boolean
    refundRef?: string
  }> {
    if (!this.secretKey) {
      throw new Error('Flutterwave secret key not configured')
    }
    // Flutterwave's refund endpoint needs the gateway's own numeric transaction id,
    // not our tx_ref — look it up first.
    const lookup = await fetch(`${this.baseUrl}/transactions/verify_by_reference?tx_ref=${gatewayRef}`, {
      headers: { Authorization: `Bearer ${this.secretKey}` },
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    const lookupData = (await lookup.json()) as FlutterwaveVerifyResponse
    if (lookupData.status !== 'success' || !lookupData.data?.id) {
      return { success: false }
    }
    const transactionId = lookupData.data.id

    const res = await fetch(`${this.baseUrl}/transactions/${transactionId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(amount ? { amount } : {}),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    const data = (await res.json()) as FlutterwaveRefundResponse
    return {
      success: data.status === 'success',
      refundRef: data.data?.id ? String(data.data.id) : undefined,
    }
  }
}

export const flutterwaveAdapter = new FlutterwaveAdapter()
