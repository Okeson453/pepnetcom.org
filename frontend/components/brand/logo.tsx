import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showDot?: boolean;
  /** Show the mark (the "P" icon) alongside the wordmark. Off by default so existing text-only call sites are unaffected. */
  showMark?: boolean;
  markSize?: number;
}

export function Logo({ className, showDot = true, showMark = false, markSize = 28 }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-display font-bold tracking-tight", className)}>
      {showMark && (
        <Image
          src="/brand/logo-mark-128.png"
          alt=""
          width={markSize}
          height={markSize}
          className="shrink-0"
          priority
        />
      )}
      PEPNETCOM{showDot && <span className="text-amber">.</span>}
    </span>
  );
}

/** Standalone mark, no wordmark — for tight spaces (mobile nav collapsed state, favicons rendered elsewhere, loading screens). */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/brand/logo-mark-128.png"
      alt="PEPNETCOM"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      priority
    />
  );
}
