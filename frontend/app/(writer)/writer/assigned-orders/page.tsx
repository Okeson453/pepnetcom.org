"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useOrders } from "@/features/orders";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
import Link from "next/link";

export default function AssignedOrdersPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useOrders({ cursor });
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Assigned Orders</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(o: any) => o.id} emptyTitle="No assigned orders"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "Order ID", cell: (o: any) => <Link href={`/writer/assigned-orders/${o.id}`} className="font-mono text-xs text-amber hover:underline">{o.id}</Link> },
          { key: "service", header: "Service", cell: (o: any) => o.serviceType },
          { key: "status", header: "Status", cell: (o: any) => o.status },
        ]} />
    </div>);
}
