import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  // §5.3: explicit per-instance Prisma pool size — see prisma-client.ts.
  // Size Postgres's max_connections against (replica count * this value),
  // with headroom for PgBouncer/direct admin connections.
  DATABASE_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  DATABASE_POOL_TIMEOUT_SECONDS: z.coerce.number().int().positive().default(10),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY_ID: z.string(),
  S3_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_REGION: z.string().default('auto'),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_PUBLIC_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_HASH: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  // Google Identity Services client ID (used to verify the `aud` claim on
  // Google-issued ID tokens — see google-auth.ts). Must be the SAME client ID
  // configured on the frontend's NEXT_PUBLIC_GOOGLE_CLIENT_ID, since an ID
  // token is only valid for the client it was requested for. Google sign-in
  // is simply unavailable (not a startup error) if this is unset.
  GOOGLE_CLIENT_ID: z.string().optional(),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  // Comma-separated extra allowed origins (staging domains, marketing site,
  // mobile app custom scheme, etc). FRONTEND_URL is always allowed; this is
  // additive so nobody has to widen CORS to '*' to add a second origin.
  ADDITIONAL_CORS_ORIGINS: z.string().optional(),
  // Only honor X-Forwarded-For/X-Real-IP (and similar) when the app is actually
  // deployed behind a trusted reverse proxy/LB that sets these authoritatively
  // and strips any client-supplied value. See rate-limiter.ts.
  TRUST_PROXY: z.coerce.boolean().default(false),
  // Which process role this instance runs as. 'web' serves HTTP only; 'worker'
  // runs BullMQ workers + the outbox relay + cron schedulers with no HTTP
  // listener; 'all' (default, dev-only) runs both in one process like before.
  // See src/server.ts and §5.2 of the audit.
  PROCESS_ROLE: z.enum(['web', 'worker', 'all']).default('all'),
  // SMS — Termii (Nigeria-focused, matches the NGN-centric payment gateway config elsewhere)
  TERMII_API_KEY: z.string().optional(),
  TERMII_SENDER_ID: z.string().default('PEPNETCOM'),
  // WhatsApp Business Cloud API (Meta)
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  // Push notifications
  ONESIGNAL_APP_ID: z.string().optional(),
  ONESIGNAL_API_KEY: z.string().optional(),
  // Optional — if set, dead-lettered jobs post an alert here (Slack/Discord/any
  // incoming-webhook-compatible URL that accepts { text }). No-op if unset.
  ALERT_WEBHOOK_URL: z.preprocess((value) => {
    if (value === '' || value == null) return undefined
    return value
  }, z.string().url().optional()),
})

export const env = envSchema.parse(process.env)
