"use client";
import { StatCard } from "@/components/data-display/stat-card";
import { DataTable } from "@/components/data-display/data-table";
import { EmptyState } from "@/components/data-display/empty-state";
import { WelcomeBanner } from "@/components/layout/welcome-banner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOrders } from "@/features/orders";

export default function ClientDashboardPage() {
  const { data: orders, isLoading } = useOrders();
  return (
    <div className="space-y-8">
      <WelcomeBanner ctaHref="/dashboard/orders/new" ctaLabel="Place your first order" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Orders" value={orders?.items.length ?? 0} />
        <StatCard label="Messages" value="0" />
        <StatCard label="Downloads" value="0" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">Recent Orders</h2>
          <Button size="sm" asChild><Link href="/dashboard/orders/new">+ New Order</Link></Button>
        </div>
        {orders && orders.items.length > 0 ? (
          <DataTable data={orders?.items ?? []} keyExtractor={(o: any) => o.id}
            columns={[
              { key: "id", header: "Order ID", cell: (o: any) => <span className="font-mono text-xs">{o.id}</span> },
              { key: "status", header: "Status", cell: (o: any) => o.status },
            ]} />
        ) : (
          <EmptyState title="No orders yet" description="Place your first order to get started." action={<Button asChild><Link href="/dashboard/orders/new">Place Order</Link></Button>} />
        )}
      </div>
    </div>);
}
