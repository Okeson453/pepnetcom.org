"use client";

import { useEffect, useState } from "react";

/**
 * Shared `prefers-reduced-motion` awareness for the Pulse Line signature
 * element and any other animated brand component. Centralizes the
 * matchMedia listener that components/brand/pulse-line.tsx previously
 * re-implemented inline.
 */
export function usePulseAnimation() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, []);

  return { shouldAnimate: !prefersReducedMotion, prefersReducedMotion };
}
