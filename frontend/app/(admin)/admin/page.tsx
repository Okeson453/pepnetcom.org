import { StatCard } from "@/components/data-display/stat-card";
import { RecentOrdersTable } from "@/features/orders/components/recent-orders-table";
import { createServerTrpcClient } from "@/lib/trpc/server";

// Server Component: data is fetched once on the server via a real HTTP call
// to the backend (see lib/trpc/server.ts) — no client-side loading spinner
// on every navigation to this page.
export default async function AdminDashboardPage() {
  const trpc = await createServerTrpcClient();
  const [analytics, recentOrders, signalStats] = await Promise.all([
    trpc.analytics.sales.overview.query({}),
    trpc.orders.list.query({}),
    trpc.signals.performanceStats.query(),
  ]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`₦${analytics.totalRevenue?.toLocaleString() ?? 0}`} trend="up" />
        <StatCard label="Transactions" value={analytics.totalTransactions ?? 0} trend="up" />
        <StatCard label="Orders" value={recentOrders.items.length} />
        <StatCard label="Signals (30D)" value={signalStats.last30Days} />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold mb-4">Recent Orders</h2>
        <RecentOrdersTable data={recentOrders.items} />
      </div>
    </div>
  );
}
