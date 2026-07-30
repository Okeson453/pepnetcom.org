import { createMiddleware } from 'hono/factory'
import { z } from 'zod'
import { ValidationError } from '../errors/domain-error'

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return createMiddleware(async (c, next) => {
    const body = await c.req.json().catch(() => ({}))
    const result = schema.safeParse(body)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }
    c.set('validatedBody', result.data)
    await next()
  })
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return createMiddleware(async (c, next) => {
    const query = Object.fromEntries(new URL(c.req.url).searchParams)
    const result = schema.safeParse(query)
    if (!result.success) {
      throw new ValidationError(result.error.message)
    }
    c.set('validatedQuery', result.data)
    await next()
  })
}
