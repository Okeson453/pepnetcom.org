"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useSignalHistory } from "@/features/signals";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function SignalHistoryPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useSignalHistory({ cursor });
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Signal History</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(s: any) => s.id} emptyTitle="No history"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "ID", cell: (s: any) => <span className="font-mono text-xs">{s.id}</span> },
          { key: "pair", header: "Pair", cell: (s: any) => s.pair },
          { key: "result", header: "Result", cell: (s: any) => <span className={s.result > 0 ? "text-teal" : "text-rust"}>{s.result}%</span> },
          { key: "date", header: "Date", cell: (s: any) => new Date(s.createdAt).toLocaleDateString() },
        ]} /></div>);
}
