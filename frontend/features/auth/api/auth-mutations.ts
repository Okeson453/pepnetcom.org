"use client";

import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@pepnetcom/backend/trpc/root-router";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Pre-session auth flows (register/forgot-password/etc.) don't go through
// the main `trpc` React client from lib/trpc/client.tsx, since there's no
// access token to attach yet — a plain vanilla client talking straight to
// the backend is simpler here. Wrapped in @tanstack/react-query's own
// useMutation directly so callers still get the full mutation interface
// (isPending/isError/mutate/etc.) the rest of the app's forms expect.
function publicClient() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not set — see .env.example.");
  return createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({ url: `${apiUrl.replace(/\/$/, "")}/api/trpc` })],
  });
}

type MutateOptions<TInput, TOutput> = Omit<UseMutationOptions<TOutput, TRPCClientError<AppRouter>, TInput>, "mutationFn">;

export function useRegister(options?: MutateOptions<RouterInputs["auth"]["register"], RouterOutputs["auth"]["register"]>) {
  return useMutation({
    ...options,
    mutationFn: (input: RouterInputs["auth"]["register"]) => publicClient().auth.register.mutate(input),
  });
}

export function useForgotPassword(options?: MutateOptions<RouterInputs["auth"]["forgotPassword"], RouterOutputs["auth"]["forgotPassword"]>) {
  return useMutation({
    ...options,
    mutationFn: (input: RouterInputs["auth"]["forgotPassword"]) => publicClient().auth.forgotPassword.mutate(input),
  });
}

export function useResetPassword(options?: MutateOptions<RouterInputs["auth"]["resetPassword"], RouterOutputs["auth"]["resetPassword"]>) {
  return useMutation({
    ...options,
    mutationFn: (input: RouterInputs["auth"]["resetPassword"]) => publicClient().auth.resetPassword.mutate(input),
  });
}

export function useVerifyEmail(options?: MutateOptions<RouterInputs["auth"]["verifyEmail"], RouterOutputs["auth"]["verifyEmail"]>) {
  return useMutation({
    ...options,
    mutationFn: (input: RouterInputs["auth"]["verifyEmail"]) => publicClient().auth.verifyEmail.mutate(input),
  });
}

export function useResendVerification(options?: MutateOptions<RouterInputs["auth"]["resendVerification"], RouterOutputs["auth"]["resendVerification"]>) {
  return useMutation({
    ...options,
    mutationFn: (input: RouterInputs["auth"]["resendVerification"]) => publicClient().auth.resendVerification.mutate(input),
  });
}
