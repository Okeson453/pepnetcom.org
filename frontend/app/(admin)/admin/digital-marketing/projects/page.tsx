"use client";
import Link from "next/link";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useMarketingProjects } from "@/features/digital-marketing";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function MarketingProjectsPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useMarketingProjects({ cursor });
  return (
    <div><div className="flex items-center justify-between mb-6">
      <h1 className="font-display text-2xl font-bold">Marketing Projects</h1>
      <Button asChild><Link href="/admin/digital-marketing/projects">+ New Project</Link></Button>
    </div>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(p: any) => p.id} emptyTitle="No projects"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "name", header: "Project", cell: (p: any) => p.name },
          { key: "client", header: "Client", cell: (p: any) => p.clientName },
          { key: "status", header: "Status", cell: (p: any) => p.status },
        ]} /></div>);
}
