"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { trpc } from "@/lib/trpc/client";

/** Thin wrapper around next-auth's client hooks so pages import from @/features/auth instead of next-auth directly. */
export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    role: session?.user?.role,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn,
    signOut,
  };
}

/**
 * Unlike register/forgotPassword/etc., changing a password requires the
 * caller to already be signed in (authedProcedure on the backend), so it
 * goes through the main bearer-token-attached trpc client rather than the
 * vanilla pre-session one in features/auth/api/auth-mutations.ts.
 */
export function useChangePassword(options?: Parameters<typeof trpc.auth.changePassword.useMutation>[0]) {
  return trpc.auth.changePassword.useMutation(options);
}

/**
 * Full current-user record from the backend (firstName/lastName/phone/
 * avatarUrl/etc.) — the NextAuth session only carries name/email/role, which
 * isn't enough to populate profile-edit forms. Backed by `auth.me`, which
 * existed on the backend but had no frontend caller until now.
 */
export function useCurrentUser() {
  const { status } = useSession();
  return trpc.auth.me.useQuery(undefined, { enabled: status === "authenticated" });
}

/** Step 1 of enabling 2FA — generates a secret + otpauth:// URI, doesn't enable anything yet. */
export function useStartTwoFactorSetup(options?: Parameters<typeof trpc.auth.twoFactor.setup.useMutation>[0]) {
  return trpc.auth.twoFactor.setup.useMutation(options);
}

/** Step 2 — confirms the authenticator produces a matching code, actually turns 2FA on, returns backup codes once. */
export function useConfirmTwoFactorSetup(options?: Parameters<typeof trpc.auth.twoFactor.confirmSetup.useMutation>[0]) {
  return trpc.auth.twoFactor.confirmSetup.useMutation(options);
}

export function useDisableTwoFactor(options?: Parameters<typeof trpc.auth.twoFactor.disable.useMutation>[0]) {
  return trpc.auth.twoFactor.disable.useMutation(options);
}
