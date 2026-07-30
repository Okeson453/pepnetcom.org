"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Segments that read better with a specific label than a title-cased slug. */
const LABEL_OVERRIDES: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  writer: "Writer",
  cms: "CMS",
  siwes: "SIWES",
  api: "API",
};

function labelFor(segment: string) {
  if (LABEL_OVERRIDES[segment]) return LABEL_OVERRIDES[segment];
  // Route params like [orderId] land here as their actual value (a cuid) —
  // truncate rather than showing a long opaque id inline.
  if (/^[a-z0-9]{20,}$/i.test(segment)) return `${segment.slice(0, 8)}…`;
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Auto-derived from the URL — no per-page configuration needed, which is
 * what makes it practical to have on every nested dashboard route instead
 * of only the few pages someone remembers to add it to by hand.
 */
export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null; // Top-level (e.g. /admin, /dashboard) — nothing to show a trail for.

  let href = "";
  const crumbs = segments.map((segment) => {
    href += `/${segment}`;
    return { href, label: labelFor(segment) };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-xs mb-4 opacity-60", className)}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />}
            {isLast ? (
              <span aria-current="page" className="font-medium">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:underline">{crumb.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
