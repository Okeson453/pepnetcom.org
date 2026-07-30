import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { writerNav } from "@/config/nav";

// See app/(admin)/layout.tsx for why this is needed — same reasoning
// applies to every personalized, session-gated writer dashboard page.
export const dynamic = "force-dynamic";

export default function WriterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <DashboardSidebar items={writerNav} role="WRITER" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar title="Writer Portal" />
        <main className="flex-1 p-8 overflow-auto"><Breadcrumbs />{children}</main>
      </div>
    </div>);
}
