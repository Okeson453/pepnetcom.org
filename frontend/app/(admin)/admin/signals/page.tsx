"use client";
import Link from "next/link";
import { StatCard } from "@/components/data-display/stat-card";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useSignals, useSignalPerformanceStats } from "@/features/signals";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function SignalDashboardPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data: signals, isLoading } = useSignals({ cursor });
  const { data: stats } = useSignalPerformanceStats();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Signal Dashboard</h1>
        <Button asChild><Link href="/admin/signals/new">+ New Signal</Link></Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Active Subscribers" value={stats?.total ?? 0} />
        <StatCard label="Accuracy (30D)" value={`${stats?.accuracy ?? 0}%`} trend="up" />
        <StatCard label="Signals Today" value={signals?.items.length ?? 0} />
      </div>
      <DataTable data={signals?.items ?? []} isLoading={isLoading} keyExtractor={(s: any) => s.id} emptyTitle="No signals"
        pagination={{ hasNext: signals?.hasMore ?? false, hasPrev, onNext: () => goToNext(signals?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "id", header: "ID", cell: (s: any) => <span className="font-mono text-xs">{s.id}</span> },
          { key: "pair", header: "Pair", cell: (s: any) => s.pair },
          { key: "direction", header: "Direction", cell: (s: any) => s.direction },
          { key: "status", header: "Status", cell: (s: any) => s.status },
        ]} /></div>);
}
