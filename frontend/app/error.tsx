"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-ink text-bone px-6">
      <h1 className="font-display text-4xl font-bold text-amber mb-4">Signal Disrupted</h1>
      <p className="text-sm opacity-60 mb-8 font-mono">{error.message}</p>
      <button
        onClick={reset}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-bone/20 text-bone font-semibold text-sm hover:bg-bone/10 transition-colors"
      >
        Retry Connection
      </button>
    </div>
  );
}
