"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  /** Optional group heading rendered above this item when it differs from the previous item's section. */
  section?: string;
}

interface DashboardSidebarProps {
  items: NavItem[];
  role: "CLIENT" | "ADMIN" | "WRITER";
}

export function DashboardSidebar({ items, role }: DashboardSidebarProps) {
  const pathname = usePathname();
  let lastSection: string | undefined;

  return (
    <aside className="w-56 bg-ink border-r border-bone/10 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <Link href={role === "ADMIN" ? "/admin" : role === "WRITER" ? "/writer" : "/dashboard"}>
          <Logo className="text-base text-bone" showMark markSize={24} />
        </Link>
      </div>
      <nav className="flex-1 px-3 pb-6" aria-label={`${role.charAt(0)}${role.slice(1).toLowerCase()} navigation`}>
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const showSection = item.section && item.section !== lastSection;
            lastSection = item.section;
            return (
              <li key={item.href}>
                {showSection && (
                  <p className="mt-4 mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-bone/35 first:mt-0">
                    {item.section}
                  </p>
                )}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors",
                    active
                      ? "bg-amber/10 text-amber-bright border-l-2 border-amber"
                      : "text-bone/60 hover:text-bone hover:bg-bone/5"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
