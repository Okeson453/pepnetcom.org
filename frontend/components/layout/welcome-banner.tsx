"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pepnetcom-onboarding-seen";

/**
 * Lightweight, client-side-only "first visit" banner — dismissal is
 * remembered per-browser via localStorage, not synced to the backend
 * (there's no "hasSeenOnboarding" field on the User model to persist it
 * properly). Good enough for a nice-to-have nudge; a real onboarding flow
 * would track this server-side instead.
 */
export function WelcomeBanner({ ctaHref, ctaLabel }: { ctaHref: string; ctaLabel: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage unavailable (private browsing, etc.) — just skip the banner.
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing to do if storage isn't available — banner just reappears next visit.
    }
  };

  if (!visible) return null;

  return (
    <div className="mb-6 flex items-start gap-4 rounded-lg border border-amber/20 bg-amber/5 p-5">
      <Sparkles className="h-5 w-5 shrink-0 text-amber-bright mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <h2 className="font-display text-sm font-semibold mb-1">Welcome to PEPNETCOM</h2>
        <p className="text-sm opacity-70 mb-3">
          One account, every service — SIWES reports, academic writing, signals, and more, all from this dashboard.
        </p>
        <Button size="sm" asChild onClick={dismiss}><Link href={ctaHref}>{ctaLabel}</Link></Button>
      </div>
      <button onClick={dismiss} aria-label="Dismiss" className="text-graphite/40 hover:text-graphite transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
