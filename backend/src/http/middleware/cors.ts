import { cors } from 'hono/cors'
import { env } from '../../config/env'

const allowedOrigins = new Set(
  [env.FRONTEND_URL, ...(env.ADDITIONAL_CORS_ORIGINS?.split(',') ?? [])]
    .map((o) => o.trim())
    .filter(Boolean),
)

export const corsMiddleware = cors({
  // Explicit allow-list, never '*' — credentials:true forbids wildcard origin
  // anyway, but this also keeps future staging/mobile origins from getting
  // added by reflexively loosening this to '*' under deadline pressure.
  origin: (origin) => (origin && allowedOrigins.has(origin) ? origin : env.FRONTEND_URL),
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'Idempotency-Key'],
  credentials: true,
})
