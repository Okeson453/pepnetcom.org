import { createMiddleware } from 'hono/factory'
import { verifyToken } from './auth.service'
import { UnauthorizedError } from '../../shared/errors/domain-error'

export const requireAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid authorization header')
  }
  const token = authHeader.slice(7)
  const result = await verifyToken(token)
  if (!result.success) {
    throw new UnauthorizedError(result.error.message)
  }
  c.set('user', result.data)
  await next()
})

export const requireRole = (...roles: string[]) =>
  createMiddleware(async (c, next) => {
    const user = c.get('user')
    if (!user) {
      throw new UnauthorizedError()
    }
    if (!roles.includes(user.role)) {
      throw new UnauthorizedError('Insufficient permissions')
    }
    await next()
  })
