"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useInvoices } from "@/features/payments";

export default function InvoicesPage() {
  const { data, isLoading } = useInvoices();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Invoices</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(i: any) => i.id} emptyTitle="No invoices"
        columns={[
          { key: "id", header: "Invoice", cell: (i: any) => <span className="font-mono text-xs">{i.id}</span> },
          { key: "amount", header: "Amount", cell: (i: any) => i.amount },
          { key: "date", header: "Date", cell: (i: any) => new Date(i.createdAt).toLocaleDateString() },
        ]} />
    </div>);
}
