import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { clientNav } from "@/config/nav";

// See app/(admin)/layout.tsx for why this is needed — same reasoning
// applies to every personalized, session-gated client dashboard page.
export const dynamic = "force-dynamic";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <DashboardSidebar items={clientNav} role="CLIENT" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar title="Client Portal" />
        <main className="flex-1 p-8 overflow-auto"><Breadcrumbs />{children}</main>
      </div>
    </div>);
}
