import { createHmac, timingSafeEqual } from 'crypto'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * Paystack signs the raw request body with HMAC-SHA512 using the secret key,
 * sent as the `x-paystack-signature` header (hex-encoded).
 * https://paystack.com/docs/payments/webhooks/#verifying-events
 */
export function verifyPaystackSignature(rawBody: string, signatureHeader: string | undefined, secretKey: string): boolean {
  if (!signatureHeader) return false
  const expected = createHmac('sha512', secretKey).update(rawBody).digest('hex')
  return safeEqual(expected, signatureHeader)
}

/**
 * Flutterwave sends back the exact secret hash configured in the dashboard
 * as the `verif-hash` header — a direct equality check, not an HMAC.
 * https://developer.flutterwave.com/docs/integration-guides/webhooks
 */
export function verifyFlutterwaveSignature(signatureHeader: string | undefined, secretHash: string): boolean {
  if (!signatureHeader) return false
  return safeEqual(signatureHeader, secretHash)
}

/**
 * Stripe signs `${timestamp}.${rawBody}` with HMAC-SHA256 using the webhook
 * signing secret. Header format: `t=<timestamp>,v1=<signature>[,v0=...]`.
 * https://stripe.com/docs/webhooks#verify-manually
 */
export function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  webhookSecret: string,
  toleranceSeconds = 300,
): boolean {
  if (!signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((kv) => {
      const [k, v] = kv.split('=')
      return [k, v]
    }),
  )
  const timestamp = parts['t']
  const v1 = parts['v1']
  if (!timestamp || !v1) return false

  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (!Number.isFinite(age) || age > toleranceSeconds) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const expected = createHmac('sha256', webhookSecret).update(signedPayload).digest('hex')
  return safeEqual(expected, v1)
}
