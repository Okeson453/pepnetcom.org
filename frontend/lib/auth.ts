import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import { z } from "zod";
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@pepnetcom/backend/trpc/root-router";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  // Only present on the second submission of the login form, once the user
  // has been told 2FA is required — see app/(auth)/login/page.tsx.
  totpCode: z.string().optional(),
});

/**
 * Auth.js only lets authorize() communicate failure back to a
 * `redirect: false` signIn() call via a thrown CredentialsSignin
 * subclass's `.code` (see node_modules/@auth/core/src/errors.ts) — a plain
 * thrown Error or a `null` return both collapse to a generic, code-less
 * failure. Three distinct codes here because the login page needs to tell
 * "wrong password" apart from "this account needs a 2FA code now" apart
 * from "that 2FA code was wrong" — very different UI in each case.
 */
class MfaRequiredSignin extends CredentialsSignin {
  code = "mfa_required";
}
class InvalidTwoFactorCodeSignin extends CredentialsSignin {
  code = "invalid_2fa_code";
}
class InvalidCredentialsSignin extends CredentialsSignin {
  code = "invalid_credentials";
}

function getApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not set — see .env.example.");
  return url.replace(/\/$/, "");
}

/**
 * Unauthenticated vanilla client — used only for the pre-session handshake
 * (login, and token refresh below), since there's no access token to attach
 * yet at those points.
 */
function publicBackendClient() {
  return createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: `${getApiUrl()}/api/trpc` })],
  });
}

async function refreshAccessToken(refreshToken: string) {
  const client = publicBackendClient();
  const result = await client.auth.refreshToken.mutate({ refreshToken });
  return {
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
    accessTokenExpires: Date.now() + result.tokens.expiresIn * 1000,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        try {
          const result = await publicBackendClient().auth.login.mutate(parsed.data);
          return {
            id: result.user.id,
            name: `${result.user.firstName} ${result.user.lastName}`.trim(),
            email: result.user.email,
            role: result.user.role as "CLIENT" | "WRITER" | "ADMIN",
            avatarUrl: result.user.avatarUrl ?? null,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            accessTokenExpires: Date.now() + result.tokens.expiresIn * 1000,
          };
        } catch (err) {
          if (err instanceof TRPCClientError) {
            if (err.message === "MFA_REQUIRED") throw new MfaRequiredSignin();
            if (err.message === "Invalid two-factor code") throw new InvalidTwoFactorCodeSignin();
            throw new InvalidCredentialsSignin();
          }
          throw err;
        }
      },
    }),
    // "Sign in with Google" — modeled as a second Credentials provider
    // rather than NextAuth's built-in GoogleProvider. The frontend gets a
    // Google-issued ID token from Google Identity Services (see
    // components/auth/google-signin-button.tsx) and hands it straight to
    // the backend's auth.googleLogin, which does the real verification
    // (signature, issuer, audience) and either finds or creates the user —
    // the backend stays the single source of truth for issuing our own
    // access/refresh tokens, exactly like the email/password path. This
    // avoids standing up a second, parallel OAuth redirect flow (with its
    // own client secret and callback URL) just to get an identity we then
    // have to reconcile against the backend anyway.
    Credentials({
      id: "google-id-token",
      name: "Google",
      credentials: {
        idToken: { label: "Google ID Token", type: "text" },
      },
      async authorize(rawCredentials) {
        const idToken = typeof rawCredentials?.idToken === "string" ? rawCredentials.idToken : "";
        if (!idToken) return null;

        try {
          const result = await publicBackendClient().auth.googleLogin.mutate({ idToken });
          return {
            id: result.user.id,
            name: `${result.user.firstName} ${result.user.lastName}`.trim(),
            email: result.user.email,
            role: result.user.role as "CLIENT" | "WRITER" | "ADMIN",
            avatarUrl: result.user.avatarUrl ?? null,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            accessTokenExpires: Date.now() + result.tokens.expiresIn * 1000,
          };
        } catch (err) {
          if (err instanceof TRPCClientError) return null;
          throw err;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First sign-in: user is the object authorize() returned above.
      if (user) {
        const u = user as typeof user & {
          role: "CLIENT" | "WRITER" | "ADMIN";
          avatarUrl?: string | null;
          accessToken: string;
          refreshToken: string;
          accessTokenExpires: number;
        };
        token.role = u.role;
        token.avatarUrl = u.avatarUrl ?? null;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenExpires = u.accessTokenExpires;
        return token;
      }

      // Subsequent requests: token still valid (with a 60s safety margin
      // for request latency) — nothing to do.
      if (typeof token.accessTokenExpires === "number" && Date.now() < token.accessTokenExpires - 60_000) {
        return token;
      }

      // Access token expired (or about to) — use the refresh token against
      // the backend's auth.refreshToken. This is what keeps a 15-minute
      // access token from forcing a re-login every 15 minutes.
      if (!token.refreshToken) {
        return { ...token, error: "RefreshAccessTokenError" as const };
      }
      try {
        const refreshed = await refreshAccessToken(token.refreshToken as string);
        return { ...token, ...refreshed, error: undefined };
      } catch {
        // Refresh token itself is dead — session.ts / the tRPC client's
        // handleUnauthorized() is responsible for signing the user out
        // when it sees this flag, since a callback can't redirect directly.
        return { ...token, error: "RefreshAccessTokenError" as const };
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "CLIENT" | "WRITER" | "ADMIN";
        session.user.id = token.sub ?? "";
        session.user.avatarUrl = token.avatarUrl as string | null | undefined;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      return session;
    },
  },
});
