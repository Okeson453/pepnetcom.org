import { Hono } from 'hono'
import { paymentsService } from '../../../modules/payments/payments.service'
import { logger } from '../../../shared/logging/logger'
import { verifyFlutterwaveSignature } from '../../../shared/security/webhook-signature'
import { env } from '../../../config/env'

const webhook = new Hono()

webhook.post('/api/webhooks/flutterwave', async (c) => {
  const rawBody = await c.req.text()
  const signature = c.req.header('verif-hash')

  if (!env.FLUTTERWAVE_SECRET_HASH || !verifyFlutterwaveSignature(signature, env.FLUTTERWAVE_SECRET_HASH)) {
    logger.error('Flutterwave webhook signature verification failed')
    return c.json({ received: false, error: 'invalid signature' }, 401)
  }

  const body = JSON.parse(rawBody)
  logger.info('Flutterwave webhook received', { status: body.status })

  if (body.status === 'successful' && body.data?.tx_ref) {
    const reference = body.data.tx_ref
    try {
      await paymentsService.verifyPayment(reference, 'flutterwave')
      return c.json({ received: true })
    } catch (err) {
      logger.error('Flutterwave webhook verification failed', { error: (err as Error).message })
      return c.json({ received: true }, 200)
    }
  }

  return c.json({ received: true })
})

export { webhook as flutterwaveWebhook }
