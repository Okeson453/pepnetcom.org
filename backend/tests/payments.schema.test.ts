import { describe, it, expect } from 'vitest'
import { paymentInitiateSchema } from '../src/modules/payments/payments.schema'

describe('paymentInitiateSchema (audit #1 — no client-trusted ad-hoc amount)', () => {
  it('rejects a request with no orderId', () => {
    const result = paymentInitiateSchema.safeParse({
      gateway: 'paystack',
      email: 'user@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejects the old ad-hoc shape (client-supplied amount, no orderId) outright', () => {
    const result = paymentInitiateSchema.safeParse({
      amount: 1,
      currency: 'NGN',
      gateway: 'paystack',
      email: 'user@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a well-formed order-linked request and strips any client-supplied amount', () => {
    const result = paymentInitiateSchema.safeParse({
      orderId: 'cljzz0000000000000000000',
      amount: 1, // should be ignored/stripped — not part of the schema anymore
      gateway: 'paystack',
      email: 'user@example.com',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('amount')
      expect(result.data.orderId).toBe('cljzz0000000000000000000')
    }
  })

  it('rejects an invalid orderId (not a cuid)', () => {
    const result = paymentInitiateSchema.safeParse({
      orderId: 'not-a-cuid',
      gateway: 'paystack',
      email: 'user@example.com',
    })
    expect(result.success).toBe(false)
  })

  it('rejects an unsupported gateway', () => {
    const result = paymentInitiateSchema.safeParse({
      orderId: 'cljzz0000000000000000000',
      gateway: 'bitcoin',
      email: 'user@example.com',
    })
    expect(result.success).toBe(false)
  })
})
