"use client";

import { useEffect, useId, useRef, useState } from "react";
import Script from "next/script";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  /** Where to send the user after a successful Google sign-in. */
  callbackUrl?: string;
  onError?: (message: string) => void;
}

/**
 * Renders Google's own "Sign in with Google" button via Google Identity
 * Services (GIS) — not NextAuth's built-in GoogleProvider redirect flow.
 * GIS hands back a signed ID token directly in the browser, which we pass
 * to the "google-id-token" Credentials provider (see lib/auth.ts), which
 * forwards it to the backend for real verification. No OAuth redirect
 * round-trip, no client secret on the frontend.
 */
export function GoogleSignInButton({ callbackUrl = "/dashboard", onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const domId = useId();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!scriptLoaded || !clientId || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        setSigningIn(true);
        try {
          const result = await signIn("google-id-token", {
            idToken: response.credential,
            redirect: false,
          });
          if (result?.error) {
            onError?.("Google sign-in failed. Please try again.");
            setSigningIn(false);
            return;
          }
          window.location.href = callbackUrl;
        } catch {
          onError?.("Google sign-in failed. Please try again.");
          setSigningIn(false);
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
    });
  }, [scriptLoaded, clientId, callbackUrl, onError]);

  if (!clientId) return null; // Google sign-in not configured — omit silently rather than show a broken button.

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="flex justify-center">
        <div ref={containerRef} id={`google-signin-${domId}`} aria-live="polite" aria-busy={signingIn} />
      </div>
    </>
  );
}
