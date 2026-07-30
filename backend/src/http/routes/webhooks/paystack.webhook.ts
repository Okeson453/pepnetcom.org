import { Hono } from 'hono'
import { paymentsService } from '../../../modules/payments/payments.service'
import { logger } from '../../../shared/logging/logger'
import { verifyPaystackSignature } from '../../../shared/security/webhook-signature'
import { env } from '../../../config/env'

const webhook = new Hono()

webhook.post('/api/webhooks/paystack', async (c) => {
  const rawBody = await c.req.text()
  const signature = c.req.header('x-paystack-signature')

  if (!env.PAYSTACK_SECRET_KEY || !verifyPaystackSignature(rawBody, signature, env.PAYSTACK_SECRET_KEY)) {
    logger.error('Paystack webhook signature verification failed')
    return c.json({ received: false, error: 'invalid signature' }, 401)
  }

  const body = JSON.parse(rawBody)
  logger.info('Paystack webhook received', { event: body.event })

  if (body.event === 'charge.success') {
    const reference = body.data.reference
    try {
      await paymentsService.verifyPayment(reference, 'paystack')
      return c.json({ received: true })
    } catch (err) {
      logger.error('Paystack webhook verification failed', { error: (err as Error).message })
      return c.json({ received: true }, 200) // Still return 200 to prevent retries — the underlying payment failure is logged and, since verifyPayment is idempotent, safe to leave for a later verify call.
    }
  }

  return c.json({ received: true })
})

export { webhook as paystackWebhook }
