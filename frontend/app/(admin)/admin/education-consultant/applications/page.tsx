"use client";
import Link from "next/link";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useConsultantApplications, useUpdateApplicationStatus } from "@/features/education-consultant";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";
export default function StudentApplicationsPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useConsultantApplications({ cursor });
  const mutation = useUpdateApplicationStatus();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Student Applications</h1>
      <DataTable data={data?.items ?? []} isLoading={isLoading} keyExtractor={(a: any) => a.id} emptyTitle="No applications"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "student", header: "Student", cell: (a: any) => a.studentName },
          { key: "university", header: "University", cell: (a: any) => a.university },
          { key: "status", header: "Status", cell: (a: any) => a.status },
          { key: "action", header: "", cell: (a: any) => <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: a.id, status: "APPROVED" })}>Approve</Button> },
        ]} /></div>);
}
