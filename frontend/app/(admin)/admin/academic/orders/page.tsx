"use client";
import Link from "next/link";
import { DataTable } from "@/components/data-display/data-table";
import { useAcademicOrders } from "@/features/academic-services";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function AcademicOrdersPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useAcademicOrders({ cursor });
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Academic Orders</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(o: any) => o.id} emptyTitle="No academic orders"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "Order ID", cell: (o: any) => <Link href={`/admin/academic/orders/${o.id}`} className="font-mono text-xs text-amber hover:underline">{o.id}</Link> },
          { key: "subject", header: "Subject", cell: (o: any) => o.subject },
          { key: "status", header: "Status", cell: (o: any) => o.status },
        ]} /></div>);
}
