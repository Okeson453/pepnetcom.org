"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useTradeStrategySalesReport } from "@/features/trade-strategies";
export default function SalesPage() {
  const { data, isLoading } = useTradeStrategySalesReport();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Sales & Downloads</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(s: any) => s.id} emptyTitle="No sales data"
        columns={[
          { key: "strategy", header: "Strategy", cell: (s: any) => s.strategyName },
          { key: "buyer", header: "Buyer", cell: (s: any) => s.buyer },
          { key: "amount", header: "Amount", cell: (s: any) => s.amount },
          { key: "date", header: "Date", cell: (s: any) => new Date(s.date).toLocaleDateString() },
        ]} /></div>);
}
