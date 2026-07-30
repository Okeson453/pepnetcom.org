"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useConsultantRequests, useUpdateConsultantRequestStatus } from "@/features/education-consultant";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function ConsultationRequestsPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useConsultantRequests({ cursor });
  const mutation = useUpdateConsultantRequestStatus();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Consultation Requests</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(r: any) => r.id} emptyTitle="No requests"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "name", header: "Name", cell: (r: any) => r.name },
          { key: "email", header: "Email", cell: (r: any) => r.email },
          { key: "status", header: "Status", cell: (r: any) => r.status },
          { key: "action", header: "", cell: (r: any) => <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: r.id, status: "REVIEWED" })}>Review</Button> },
        ]} /></div>);
}
