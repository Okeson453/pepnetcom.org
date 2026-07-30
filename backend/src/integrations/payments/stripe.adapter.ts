import { env } from '../../config/env'
import type { PaymentGatewayPort } from './payment-gateway.port'

const GATEWAY_TIMEOUT_MS = 8000

export class StripeAdapter implements PaymentGatewayPort {
  name = 'stripe'
  private baseUrl = 'https://api.stripe.com/v1'
  private secretKey = env.STRIPE_SECRET_KEY ?? ''

  private async request(endpoint: string, body?: URLSearchParams): Promise<any> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: body ? 'POST' : 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body?.toString(),
      signal: AbortSignal.timeout(GATEWAY_TIMEOUT_MS),
    })
    return res.json()
  }

  async initiatePayment(params: {
    amount: number
    currency: string
    email: string
    reference: string
    metadata?: Record<string, unknown>
  }): Promise<{ authorizationUrl: string; gatewayRef: string }> {
    if (!this.secretKey) {
      throw new Error('Stripe secret key not configured')
    }
    const body = new URLSearchParams({
      'payment_intent_data[metadata][reference]': params.reference,
      'line_items[0][price_data][currency]': params.currency.toLowerCase(),
      'line_items[0][price_data][unit_amount]': Math.round(params.amount * 100).toString(),
      'line_items[0][quantity]': '1',
      mode: 'payment',
      success_url: `${env.FRONTEND_URL}/payment/success?reference=${params.reference}`,
      cancel_url: `${env.FRONTEND_URL}/payment/cancel`,
      'customer_email': params.email,
    })
    const session = await this.request('/checkout/sessions', body)
    if (session.error) {
      throw new Error(session.error.message)
    }
    return {
      authorizationUrl: session.url,
      gatewayRef: session.id,
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
      throw new Error('Stripe secret key not configured')
    }
    const session = await this.request(`/checkout/sessions/${gatewayRef}`)
    if (session.error) {
      return { success: false, amount: 0, currency: 'USD' }
    }
    return {
      success: session.payment_status === 'paid',
      amount: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
      paidAt: session.payment_status === 'paid' ? new Date() : undefined,
      metadata: session.metadata,
    }
  }

  async refundPayment(gatewayRef: string, amount?: number): Promise<{
    success: boolean
    refundRef?: string
  }> {
    if (!this.secretKey) {
      throw new Error('Stripe secret key not configured')
    }
    const body = new URLSearchParams({
      payment_intent: gatewayRef,
      ...(amount ? { amount: Math.round(amount * 100).toString() } : {}),
    })
    const refund = await this.request('/refunds', body)
    return { success: !refund.error, refundRef: refund.id }
  }
}

export const stripeAdapter = new StripeAdapter()
