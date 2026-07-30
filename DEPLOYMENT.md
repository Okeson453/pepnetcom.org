# Deploying PEPNETCOM

Two separate services, deployed separately: `frontend/` on Vercel,
`backend/` on Railway. This doc covers the real gotchas specific to this
repo's structure — not a generic "how Vercel/Railway work" guide.

## Backend → Railway

1. **New Railway project → Deploy from GitHub repo**, select this repo.
2. **Root Directory**: set to `backend`. Railway will pick up
   `backend/railway.json` automatically once the root directory is set —
   it points at `docker/Dockerfile` (a real multi-stage build already in
   the repo, not something this pass invented) and sets the health check
   path to `/api/health`.
3. **Add plugins**: Postgres and Redis, from Railway's plugin marketplace.
   Railway auto-injects `DATABASE_URL` for Postgres — but this repo's env
   schema expects `REDIS_URL` (not Railway's default `REDIS_PRIVATE_URL`
   naming), so add a variable reference: `REDIS_URL = ${{Redis.REDIS_URL}}`
   (adjust the plugin's variable name to whatever Railway names it in your
   project — check the Redis plugin's "Variables" tab).
4. **Set the remaining environment variables** from `backend/.env.example`
   — at minimum `JWT_SECRET`, `JWT_REFRESH_SECRET` (generate real random
   32+ char values, e.g. `openssl rand -base64 32`), `FRONTEND_URL` (your
   Vercel deployment's URL, once you have it), and whichever
   payment/email/SMS/storage provider keys you're actually using — every
   one of them is optional at the schema level and the corresponding
   feature just won't work until set, not a startup crash.
5. **Run the initial migration** once the service is up:
   `railway run --service <backend-service-name> bun run db:migrate:deploy`
   (or open a Railway shell into the service and run it there). This repo
   has never had `prisma generate`/migrations actually run end-to-end in
   the sandbox this was built in — confirm this step works before trusting
   anything downstream of it.
6. **Webhooks**: point Paystack/Flutterwave/Stripe's webhook URLs at this
   Railway service's public domain directly (`https://<your-app>.up.railway.app/webhooks/...`
   — see `src/http/app.ts` for exact paths), not at the frontend. The
   frontend has no webhook routes of its own by design (see
   `INTEGRATION.md`).
7. **Scaling the job/cron workload later**: `PROCESS_ROLE` defaults to
   `all` (HTTP + BullMQ workers + outbox relay + cron in one process),
   which is fine for launch. If load grows, add a *second* Railway service
   from the same repo/Dockerfile with `PROCESS_ROLE=worker` and no public
   domain, and set the original service to `PROCESS_ROLE=web` — see
   `src/server.ts`.

## Frontend → Vercel

1. **New Vercel project → import this repo.**
2. **Root Directory**: set to `frontend` — **but** open
   *Settings → General → Root Directory* and enable **"Include source
   files outside of the Root Directory in the Build Step."** This is not
   optional: `frontend/tsconfig.json` has a path alias
   (`@pepnetcom/backend/*` → `../backend/src/*`) that gives the frontend
   real compile-time type safety against the backend's actual `AppRouter`
   (see `INTEGRATION.md`). Without that checkbox, Vercel's build only
   uploads the `frontend/` subtree, the alias resolves to nothing, and the
   build fails on every file that imports `AppRouter`.
3. **Environment variables** from `frontend/.env.example`:
   `NEXT_PUBLIC_API_URL` (the Railway backend's public URL from above),
   `NEXT_PUBLIC_SITE_URL` (this Vercel deployment's own URL),
   `NEXTAUTH_URL` (same as `NEXT_PUBLIC_SITE_URL`), `NEXTAUTH_SECRET` /
   `AUTH_SECRET` (generate a real random value, both need to be set to the
   *same* string), and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` if Google sign-in is
   enabled (see below).
4. **Framework preset**: Next.js is auto-detected; `frontend/vercel.json`
   pins the build/install commands explicitly so a monorepo-confused
   auto-detect can't silently pick the wrong ones.
5. Once deployed, go back to the Railway backend and set its `FRONTEND_URL`
   to this Vercel URL (needed for CORS — see `backend/src/http/middleware/cors.ts`).
   Add any Vercel preview-deployment domains you want to also allow to
   `ADDITIONAL_CORS_ORIGINS` (comma-separated) on the backend.

## Google Sign-In setup (optional feature)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs &
   Services → Credentials → **Create OAuth client ID** → Web application.
2. **Authorized JavaScript origins**: add your Vercel URL (and
   `http://localhost:3001` for local dev).
3. Copy the generated **Client ID** — no client *secret* is needed for this
   implementation (see `INTEGRATION.md` for why: it verifies ID tokens
   server-side rather than doing a full OAuth redirect flow).
4. Set the **same** client ID as `GOOGLE_CLIENT_ID` on the Railway backend
   and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on the Vercel frontend — an ID token
   is only valid for the exact client it was requested for, so these must
   match exactly. If either is unset, the Google button/verification is
   simply skipped, not a hard error.

## Order of operations for a first deploy

Backend first (steps above), note its URL → Frontend second, pointing
`NEXT_PUBLIC_API_URL` at it → back to backend to set `FRONTEND_URL` once
you have the Vercel URL → Google OAuth client last, once both URLs are
final.

## Known build warning (not an error)

`next build` prints two Edge Runtime warnings about `jose` using
`CompressionStream`/`DecompressionStream` inside `lib/auth.ts`'s import
chain (NextAuth → `@auth/core` → `jose`). This is a warning, not a build
failure, and standard JWT session usage (what this app does) shouldn't hit
the code path that needs compression. Worth a real smoke test of
`middleware.ts` on Vercel's actual Edge Runtime after first deploy, since
that's not something this sandbox can verify — if it does surface a
runtime error, the fix is setting `export const runtime = "nodejs"` in
`middleware.ts` (Node.js middleware runtime is now supported by Next.js,
trading a little cold-start latency for full Node API compatibility).
