"use client";
import Link from "next/link";
import { DataTable } from "@/components/data-display/data-table";
import { useSiwesOrders } from "@/features/siwes";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function SiwesOrdersPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useSiwesOrders({ cursor });
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">SIWES Orders</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(o: any) => o.id} emptyTitle="No SIWES orders"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "Order ID", cell: (o: any) => <Link href={`/admin/siwes/orders/${o.id}`} className="font-mono text-xs text-amber hover:underline">{o.id}</Link> },
          { key: "client", header: "Client", cell: (o: any) => o.user?.name ?? "—" },
          { key: "status", header: "Status", cell: (o: any) => o.status },
          { key: "created", header: "Date", cell: (o: any) => new Date(o.createdAt).toLocaleDateString() },
        ]} /></div>);
}
