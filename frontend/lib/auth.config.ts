import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the full NextAuth config in lib/auth.ts.
 *
 * middleware.ts runs on Vercel's Edge runtime, which is stricter than a
 * normal Node.js function (no arbitrary Node APIs, tighter bundle-size
 * limits). The full config in lib/auth.ts pulls in the Credentials
 * providers' authorize() functions, which call the backend through
 * @trpc/client — none of that is needed just to read `role`/`error` off an
 * already-issued JWT and redirect, but bundling it into middleware anyway
 * means dragging @trpc/client (and its transitive deps) into the Edge
 * function for no reason, and is exactly the kind of thing that builds fine
 * locally but can fail or bloat the function once actually deployed to
 * Vercel Edge.
 *
 * Per NextAuth v5's own recommended pattern, this file has no `providers`
 * and does no I/O — it's split out so middleware.ts can build a second,
 * minimal `auth()` from just this config (see NextAuth(authConfig).auth in
 * middleware.ts), while lib/auth.ts's full config — providers, the
 * refresh-token network call, everything — stays on the Node runtime via
 * app/api/auth/[...nextauth]/route.ts.
 *
 * `jwt`/`session` are deliberately NOT duplicated here: they're only ever
 * invoked when a JWT already exists (decoding, not issuing), and NextAuth
 * reuses whatever shape the token already has regardless of which config
 * instance reads it, so middleware sees `role`/`avatarUrl`/`error` exactly
 * as lib/auth.ts wrote them without needing its own copy of those
 * callbacks.
 */
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
