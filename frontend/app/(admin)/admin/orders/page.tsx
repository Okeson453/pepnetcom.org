"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useOrders } from "@/features/orders";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function AllOrdersPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useOrders({ cursor });
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">All Orders</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(o: any) => o.id} emptyTitle="No orders"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "Order ID", cell: (o: any) => <span className="font-mono text-xs">{o.id}</span> },
          { key: "client", header: "Client", cell: (o: any) => o.user?.name ?? "—" },
          { key: "service", header: "Service", cell: (o: any) => o.serviceType },
          { key: "status", header: "Status", cell: (o: any) => o.status },
          { key: "amount", header: "Amount", cell: (o: any) => o.amount ?? "—" },
        ]} /></div>);
}
