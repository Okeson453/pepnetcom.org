"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirementsProps {
  password: string;
}

const CRITERIA = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Contains a number", test: (p: string) => /\d/.test(p) },
  { label: "Contains a symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * Live checklist that turns green as the typed password satisfies each
 * criterion. Only the 8-character minimum is actually enforced by the
 * backend (registerSchema requires min 8, nothing about numbers/symbols) —
 * the number/symbol checks here are guidance toward a stronger password,
 * not a hard requirement, so this never blocks submission on its own.
 */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <ul className="space-y-1 mt-1.5">
      {CRITERIA.map((c) => {
        const met = c.test(password);
        return (
          <li key={c.label} className={cn("flex items-center gap-1.5 text-xs transition-colors", met ? "text-teal" : "text-graphite/40")}>
            <span
              className={cn(
                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-colors",
                met ? "border-teal bg-teal/15" : "border-graphite/25"
              )}
            >
              {met && <Check className="h-2.5 w-2.5" />}
            </span>
            {c.label}
          </li>
        );
      })}
    </ul>
  );
}
