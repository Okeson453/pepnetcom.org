"use client";

import Link from "next/link";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth";

const PROFILE_HREF: Record<"CLIENT" | "WRITER" | "ADMIN", string> = {
  CLIENT: "/dashboard/profile",
  WRITER: "/writer/profile",
  ADMIN: "/admin/profile",
};

const SETTINGS_HREF: Record<"CLIENT" | "WRITER" | "ADMIN", string> = {
  CLIENT: "/dashboard/settings",
  WRITER: "/writer/settings",
  ADMIN: "/admin/settings/general",
};

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "").concat(parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "").toUpperCase();
}

/**
 * Persistent identity + logout affordance for the dashboard chrome —
 * previously missing entirely (no in-app way to end a session, and no
 * visual confirmation of who's logged in beyond the sidebar's nav state).
 */
export function UserMenu() {
  const { user, role, signOut } = useAuth();

  if (!user) return null;
  const safeRole = (role ?? "CLIENT") as "CLIENT" | "WRITER" | "ADMIN";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-bone/5 transition-colors"
          aria-label="Account menu"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-amber/15 text-amber-bright text-xs font-mono font-semibold">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- external Google/backend-hosted URLs, not worth wiring into next/image's domain allowlist for a single 32px avatar
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initials(user.name)
            )}
          </span>
          <span className="hidden sm:block leading-tight">
            <span className="block text-sm font-medium text-bone">{user.name}</span>
            <span className="block text-[11px] uppercase tracking-wide text-bone/40 font-mono">{safeRole}</span>
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={PROFILE_HREF[safeRole]}>
            <UserIcon className="h-4 w-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={SETTINGS_HREF[safeRole]}>
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => signOut({ callbackUrl: "/login" })} className="text-rust">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
