"use client";

import { useEffect, useRef, useState } from "react";
import { getSession } from "next-auth/react";

export interface SignalFeedEvent {
  type: "connected" | "SIGNAL_CREATED" | "SIGNAL_CLOSED";
  signal?: unknown;
  timestamp?: string;
}

/**
 * Live signal ticker via the backend's SSE endpoint (GET /api/signals/live —
 * see src/http/app.ts and signal-broadcast.service.ts on the backend). This
 * is NOT a tRPC procedure and can't go through the tRPC client — it's a
 * plain EventSource connection, separate wiring from every other hook in
 * features/signals per the integration report.
 *
 * Auth: the backend route requires a CLIENT/ADMIN-role access token as a
 * `?token=` query param (EventSource can't send custom headers, so a header
 * isn't an option). We pull the current session's access token the same way
 * lib/trpc/client.tsx does and refuse to connect without one.
 */
export function useSignalFeed() {
  const [events, setEvents] = useState<SignalFeedEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    let cancelled = false;

    async function connect() {
      const session = await getSession();
      if (cancelled) return;
      const token = session?.accessToken;
      if (!token) {
        // Not signed in (or session has no usable token) — nothing to
        // subscribe to. Deliberately doesn't retry; a fresh call to this
        // hook after sign-in will pick up a session.
        return;
      }

      const source = new EventSource(`${apiUrl}/api/signals/live?token=${encodeURIComponent(token)}`);
      sourceRef.current = source;

      source.onopen = () => !cancelled && setConnected(true);
      source.onmessage = (e) => {
        if (cancelled) return;
        try {
          const parsed = JSON.parse(e.data) as SignalFeedEvent;
          setEvents((prev) => [parsed, ...prev].slice(0, 50));
        } catch {
          // Malformed frame — drop it rather than crash the ticker.
        }
      };
      source.onerror = () => {
        if (cancelled) return;
        setConnected(false);
        source.close();
        // Basic reconnect with a fixed backoff — EventSource auto-reconnects
        // on its own too, but closing+recreating avoids it getting stuck in
        // some browsers' "CONNECTING forever" state after a server restart.
        setTimeout(() => !cancelled && connect(), 3000);
      };
    }

    connect();
    return () => {
      cancelled = true;
      sourceRef.current?.close();
    };
  }, []);

  return { events, connected };
}
