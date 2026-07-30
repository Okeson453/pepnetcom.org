import "server-only";
import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@pepnetcom/backend/trpc/root-router";
import { auth } from "@/lib/auth";

function getApiUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set — see .env.example.");
  }
  return url.replace(/\/$/, "");
}

/**
 * Server-side tRPC client for Server Components and Route Handlers — makes
 * a real HTTP request to the backend (unlike the old in-process
 * appRouter.createCaller() pattern from when the router lived locally).
 * Reads the access token via auth() (works in RSC/Route Handler request
 * scope through next/headers) and attaches it the same way the client-side
 * link does.
 */
export async function createServerTrpcClient() {
  const session = await auth();
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${getApiUrl()}/api/trpc`,
        headers: () => (session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : {}),
      }),
    ],
  });
}

export { TRPCClientError };
