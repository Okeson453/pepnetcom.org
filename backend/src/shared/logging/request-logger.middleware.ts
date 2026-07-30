import { createMiddleware } from 'hono/factory'
import { logger } from './logger'

export const requestLoggerMiddleware = createMiddleware(async (c, next) => {
  const start = Date.now()
  await next()
  const duration = Date.now() - start
  logger.info(`${c.req.method} ${c.req.path}`, {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration,
    requestId: c.get('requestId'),
  })
})
