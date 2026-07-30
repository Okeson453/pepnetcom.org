import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CLIENT" | "WRITER" | "ADMIN";
      /** Google profile photo or backend-stored avatarUrl, if either exists. Null/undefined → UserMenu falls back to initials. */
      avatarUrl?: string | null;
    } & DefaultSession["user"];
    /** Backend-issued JWT — attached as `Authorization: Bearer` on every tRPC call. See lib/trpc/client.tsx. */
    accessToken?: string;
    /** Set when the refresh token itself is dead — the tRPC client / a page effect should sign the user out on seeing this. */
    error?: "RefreshAccessTokenError";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "CLIENT" | "WRITER" | "ADMIN";
    avatarUrl?: string | null;
    accessToken?: string;
    refreshToken?: string;
    /** Unix ms timestamp — when to proactively refresh via lib/auth.ts's jwt() callback. */
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError";
  }
}
