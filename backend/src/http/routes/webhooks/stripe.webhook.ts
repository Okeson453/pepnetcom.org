import { Hono } from 'hono'
import { env } from '../../../config/env'
import { paymentsService } from '../../../modules/payments/payments.service'
import { logger } from '../../../shared/logging/logger'
import { verifyStripeSignature } from '../../../shared/security/webhook-signature'

const webhook = new Hono()

webhook.post('/api/webhooks/stripe', async (c) => {
  const payload = await c.req.text()
  const sig = c.req.header('stripe-signature')

  if (!env.STRIPE_WEBHOOK_SECRET || !verifyStripeSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET)) {
    logger.error('Stripe webhook signature verification failed')
    return c.json({ received: false, error: 'invalid signature' }, 401)
  }

  logger.info('Stripe webhook received')

  try {
    const event = JSON.parse(payload)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      await paymentsService.verifyPayment(session.id, 'stripe')
    }
    return c.json({ received: true })
  } catch (err) {
    logger.error('Stripe webhook processing failed', { error: (err as Error).message })
    return c.json({ received: true }, 200)
  }
})

export { webhook as stripeWebhook }
