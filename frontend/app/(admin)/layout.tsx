import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { adminNav } from "@/config/nav";

// Every page under (admin) shows per-user, session-gated data and sits
// behind middleware.ts's role check — none of it is static content, so it
// should never be prerendered at build time. Without this, Next's static
// optimizer tried to prerender these pages during `next build` (since
// middleware alone doesn't mark a route dynamic) and failed outright on
// pages whose client components pass function props (DataTable columns/
// onClick handlers) through what static generation treats as a Server
// Component boundary.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-bone flex">
      <DashboardSidebar items={adminNav} role="ADMIN" />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopbar title="Admin Portal" />
        <main className="flex-1 p-8 overflow-auto"><Breadcrumbs />{children}</main>
      </div>
    </div>);
}
