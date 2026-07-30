"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useInvoices } from "@/features/payments";
export default function InvoicesPage() {
  const { data, isLoading } = useInvoices();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Invoices</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(i: any) => i.id} emptyTitle="No invoices"
        columns={[
          { key: "id", header: "Invoice", cell: (i: any) => <span className="font-mono text-xs">{i.id}</span> },
          { key: "client", header: "Client", cell: (i: any) => i.clientName },
          { key: "amount", header: "Amount", cell: (i: any) => i.amount },
          { key: "status", header: "Status", cell: (i: any) => i.status },
        ]} /></div>);
}
