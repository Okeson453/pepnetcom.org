"use client";

import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { getSession, signOut } from "next-auth/react";
import type { AppRouter } from "@pepnetcom/backend/trpc/root-router";

export const trpc = createTRPCReact<AppRouter>();

function getApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set — the frontend has no local API of its own anymore; " +
        "it talks directly to the pepnetcom-backend service. See .env.example."
    );
  }
  return url.replace(/\/$/, "");
}

/**
 * Every authenticated call needs `Authorization: Bearer <accessToken>` per
 * the backend's auth contract (src/trpc/context.ts reads this header and
 * nothing else — no cookies, no CSRF, stateless on the request path).
 * `getSession()` triggers NextAuth's `jwt()` callback under the hood, which
 * is where the actual access-token refresh-on-expiry logic lives (see
 * lib/auth.ts) — so this always has a current token without the tRPC link
 * layer needing its own refresh machinery.
 */
async function authHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  if (!session?.accessToken) return {};
  return { authorization: `Bearer ${session.accessToken}` };
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry auth/permission failures — retrying won't fix a
              // bad/expired token that refresh already couldn't save, and it
              // just delays the redirect below.
              if (
                error instanceof TRPCClientError &&
                (error.data?.code === "UNAUTHORIZED" || error.data?.code === "FORBIDDEN")
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/api/trpc`,
          headers: authHeaders,
          fetch(url, options) {
            return fetch(url, { ...options, credentials: "omit" });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

/**
 * Call from a query/mutation's onError (or a global QueryCache config) when
 * a request comes back UNAUTHORIZED even after NextAuth's own refresh
 * attempt — meaning the refresh token itself is dead, not just the access
 * token. Signs out locally and sends the user back to login.
 */
export async function handleUnauthorized() {
  await signOut({ callbackUrl: "/login" });
}
