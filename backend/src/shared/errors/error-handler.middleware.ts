import { createMiddleware } from 'hono/factory'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { DomainError, NotFoundError } from './domain-error'
import { ZodError } from 'zod'
import { logger } from '../logging/logger'

/**
 * Shared shaping logic for both the in-chain middleware below and the
 * app-level `app.onError` safety net registered in http/app.ts. Kept as one
 * function so the two never drift into inconsistent response shapes.
 */
export function buildErrorResponse(err: unknown, c: Context) {
  const requestId = c.get('requestId') as string | undefined

  if (err instanceof DomainError) {
    return c.json(
      { success: false, error: { code: err.code, message: err.message }, requestId },
      err.statusCode as ContentfulStatusCode
    )
  }

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: err.flatten() },
      requestId,
    }, 400)
  }

  logger.error('Unhandled error', { error: (err as Error)?.message, stack: (err as Error)?.stack, requestId })
  return c.json({
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
    requestId,
  }, 500)
}

// In-chain safety net: catches anything thrown by middleware/routes
// registered *after* this one (requestLogger, rate limiting, health,
// webhooks, the signals SSE route, tRPC). Kept in addition to app.onError
// below (rather than replaced by it) because it has access to `requestId`
// at the point in the chain where that's already been set, and because
// app.onError alone won't fire for errors thrown by middleware registered
// *before* it in app.ts (securityHeaders, compression, requestId, cors) —
// see the comment on app.onError in http/app.ts for why both exist.
export const errorHandlerMiddleware = createMiddleware(async (c, next) => {
  try {
    await next()
    return
  } catch (err) {
    return buildErrorResponse(err, c)
  }
})
