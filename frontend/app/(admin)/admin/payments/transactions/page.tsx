"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useTransactions } from "@/features/payments";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function TransactionsPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useTransactions({ cursor });
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Transactions</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(t: any) => t.id} emptyTitle="No transactions"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "ID", cell: (t: any) => <span className="font-mono text-xs">{t.id}</span> },
          { key: "amount", header: "Amount", cell: (t: any) => t.amount },
          { key: "gateway", header: "Gateway", cell: (t: any) => t.gateway },
          { key: "status", header: "Status", cell: (t: any) => t.status },
        ]} /></div>);
}
