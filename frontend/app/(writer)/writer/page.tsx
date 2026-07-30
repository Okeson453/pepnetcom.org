"use client";
import { StatCard } from "@/components/data-display/stat-card";
import { DataTable } from "@/components/data-display/data-table";
import { useOrders } from "@/features/orders";
import Link from "next/link";

export default function WriterDashboardPage() {
  const { data: orders, isLoading } = useOrders();
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Assigned Orders" value={orders?.items.length ?? 0} />
        <StatCard label="Due This Week" value="0" />
        <StatCard label="Completed" value="0" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold mb-4">Assigned Orders</h2>
        <DataTable data={orders?.items ?? []} isLoading={isLoading} keyExtractor={(o: any) => o.id} emptyTitle="No assigned orders"
          columns={[
            { key: "id", header: "Order ID", cell: (o: any) => <Link href={`/writer/assigned-orders/${o.id}`} className="font-mono text-xs text-amber hover:underline">{o.id}</Link> },
            { key: "status", header: "Status", cell: (o: any) => o.status },
            { key: "deadline", header: "Deadline", cell: (o: any) => o.deadline ? new Date(o.deadline).toLocaleDateString() : "—" },
          ]} />
      </div>
    </div>);
}
