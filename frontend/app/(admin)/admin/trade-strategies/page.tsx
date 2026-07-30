"use client";
import Link from "next/link";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useTradeStrategies } from "@/features/trade-strategies";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function StrategyLibraryPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useTradeStrategies({ cursor });
  return (
    <div><div className="flex items-center justify-between mb-6">
      <h1 className="font-display text-2xl font-bold">Strategy Library</h1>
      <Button asChild><Link href="/admin/trade-strategies/new">+ Add Strategy</Link></Button>
    </div>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(s: any) => s.id} emptyTitle="No strategies"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "name", header: "Name", cell: (s: any) => <Link href={`/admin/trade-strategies/${s.id}/edit`} className="text-amber hover:underline">{s.name}</Link> },
          { key: "type", header: "Type", cell: (s: any) => s.type },
          { key: "performance", header: "Performance", cell: (s: any) => <span className="font-mono text-teal">{s.performance ?? "—"}</span> },
        ]} /></div>);
}
