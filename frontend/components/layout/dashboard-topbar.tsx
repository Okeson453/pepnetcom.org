"use client";

import { UserMenu } from "@/components/layout/user-menu";

interface DashboardTopbarProps {
  title: string;
  action?: React.ReactNode;
}

export function DashboardTopbar({ title, action }: DashboardTopbarProps) {
  return (
    <header className="h-16 bg-ink border-b border-bone/10 flex items-center justify-between px-8 sticky top-0 z-40">
      <h1 className="font-display text-lg font-semibold text-bone">{title}</h1>
      <div className="flex items-center gap-4">
        {action && <div>{action}</div>}
        <UserMenu />
      </div>
    </header>
  );
}
