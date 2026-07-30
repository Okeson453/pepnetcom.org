import { Hono } from 'hono'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { corsMiddleware } from './middleware/cors'
import { requestIdMiddleware } from './middleware/request-id'
import { compressionMiddleware } from './middleware/compression'
import { securityHeadersMiddleware } from './middleware/security-headers'
import { health } from './routes/health.route'
import { paystackWebhook } from './routes/webhooks/paystack.webhook'
import { flutterwaveWebhook } from './routes/webhooks/flutterwave.webhook'
import { stripeWebhook } from './routes/webhooks/stripe.webhook'
import { appRouter } from '../trpc/root-router'
import { createTRPCContext } from '../trpc/context'
import { signalBroadcastService } from '../modules/signals/signal-broadcast.service'
import { signalsRepository } from '../modules/signals/signals.repository'
import { verifyToken } from '../modules/auth/auth.service'
import { requestLoggerMiddleware } from '../shared/logging/request-logger.middleware'
import { errorHandlerMiddleware, buildErrorResponse } from '../shared/errors/error-handler.middleware'
import { apiRateLimitMiddleware } from '../shared/rate-limit/rate-limiter'

export const app = new Hono()

// True last-resort safety net (audit #6): errorHandlerMiddleware below only
// catches errors thrown by middleware/routes registered *after* it — an
// exception thrown inside securityHeadersMiddleware, compressionMiddleware,
// requestIdMiddleware, or corsMiddleware (all registered before it, so they
// wrap it) would previously fall through to Hono's bare default 500 instead
// of a controlled, logged, stack-trace-free response. app.onError is
// registered at the Hono instance level, so it catches literally anything
// unhandled anywhere in the app, regardless of middleware order.
app.onError((err, c) => buildErrorResponse(err, c))

// Global middleware
app.use(securityHeadersMiddleware)
app.use(compressionMiddleware)
app.use(requestIdMiddleware)
app.use(corsMiddleware)
app.use(errorHandlerMiddleware)
app.use(requestLoggerMiddleware)
app.use(apiRateLimitMiddleware())

// Health check
app.route('/', health)

// Webhooks
app.route('/', paystackWebhook)
app.route('/', flutterwaveWebhook)
app.route('/', stripeWebhook)

// Signals live feed (SSE)
// This is a paid, gated feature (CLIENT or ADMIN only) — same access rule as
// every other `signals.*` tRPC procedure (see clientProcedure in trpc/trpc.ts).
// EventSource can't send an Authorization header, so the token travels as a
// `?token=` query param instead (see hooks/use-signal-feed.ts on the frontend).
app.get('/api/signals/live', async (c) => {
  const token = c.req.query('token')
  if (!token) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing token' } }, 401)
  }

  const result = await verifyToken(token)
  if (!result.success) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401)
  }

  if (result.data.role !== 'CLIENT' && result.data.role !== 'ADMIN') {
    return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Signals access requires an active subscription' } }, 403)
  }
  if (result.data.role === 'CLIENT') {
    const activeSubscription = await signalsRepository.findActiveSubscription(result.data.id)
    if (!activeSubscription) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Signals access requires an active subscription' } }, 403)
    }
  }

  const clientId = crypto.randomUUID()
  const stream = new ReadableStream({
    start(controller) {
      signalBroadcastService.addClient(clientId, controller)
      controller.enqueue(new TextEncoder().encode('data: {"type":"connected"}\n\n'))
    },
    cancel() {
      signalBroadcastService.removeClient(clientId)
    },
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

// tRPC router
app.all('/api/trpc/*', async (c) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: c.req.raw,
    router: appRouter,
    createContext: () => createTRPCContext({ req: c.req.raw, honoCtx: c }),
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Not Found' }, path: c.req.path }, 404)
})
