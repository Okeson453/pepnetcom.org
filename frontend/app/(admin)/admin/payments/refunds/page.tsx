"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useRefunds, useUpdateRefundStatus } from "@/features/payments";
export default function RefundRequestsPage() {
  const { data, isLoading } = useRefunds();
  const mutation = useUpdateRefundStatus();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Refund Requests</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(r: any) => r.id} emptyTitle="No refund requests"
        columns={[
          { key: "id", header: "ID", cell: (r: any) => <span className="font-mono text-xs">{r.id}</span> },
          { key: "order", header: "Order", cell: (r: any) => r.orderId },
          { key: "reason", header: "Reason", cell: (r: any) => r.reason },
          { key: "status", header: "Status", cell: (r: any) => r.status },
          { key: "action", header: "", cell: (r: any) => <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: r.id, status: "APPROVED" })}>Approve</Button> },
        ]} /></div>);
}
