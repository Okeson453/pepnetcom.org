"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useSignalSubscribers, useUpdateSubscriberStatus } from "@/features/signals";
export default function SubscriberManagementPage() {
  const { data, isLoading } = useSignalSubscribers();
  const mutation = useUpdateSubscriberStatus();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Subscriber Management</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(s: any) => s.id} emptyTitle="No subscribers"
        columns={[
          { key: "name", header: "Name", cell: (s: any) => s.name },
          { key: "email", header: "Email", cell: (s: any) => s.email },
          { key: "plan", header: "Plan", cell: (s: any) => s.plan },
          { key: "status", header: "Status", cell: (s: any) => s.status },
          { key: "action", header: "", cell: (s: any) => <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: s.id, status: "CANCELLED" })}>Cancel</Button> },
        ]} /></div>);
}
