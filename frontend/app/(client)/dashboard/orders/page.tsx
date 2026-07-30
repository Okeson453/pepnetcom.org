"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOrders } from "@/features/orders";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";

export default function MyOrdersPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data: orders, isLoading } = useOrders({ cursor });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">My Orders</h1>
        <Button asChild><Link href="/dashboard/orders/new">+ New Order</Link></Button>
      </div>
      <DataTable data={orders?.items ?? []} isLoading={isLoading} keyExtractor={(o: any) => o.id} emptyTitle="No orders found"
        caption="My orders"
        pagination={{ hasNext: orders?.hasMore ?? false, hasPrev, onNext: () => goToNext(orders?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "Order ID", cell: (o: any) => <span className="font-mono text-xs">{o.id}</span> },
          { key: "service", header: "Service", cell: (o: any) => o.serviceType },
          { key: "status", header: "Status", cell: (o: any) => o.status },
          { key: "date", header: "Date", cell: (o: any) => new Date(o.createdAt).toLocaleDateString() },
        ]} />
    </div>);
}
