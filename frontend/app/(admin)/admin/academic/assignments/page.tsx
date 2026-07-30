"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useAcademicAssignments, useUpdateAssignmentStatus } from "@/features/academic-services";
export default function AssignmentManagementPage() {
  const { data, isLoading } = useAcademicAssignments();
  const mutation = useUpdateAssignmentStatus();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Assignment Management</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(a: any) => a.id} emptyTitle="No assignments"
        columns={[
          { key: "id", header: "ID", cell: (a: any) => <span className="font-mono text-xs">{a.id}</span> },
          { key: "title", header: "Title", cell: (a: any) => a.title },
          { key: "status", header: "Status", cell: (a: any) => a.status },
          { key: "action", header: "", cell: (a: any) => <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: a.id, status: "COMPLETED" })}>Mark Done</Button> },
        ]} /></div>);
}
