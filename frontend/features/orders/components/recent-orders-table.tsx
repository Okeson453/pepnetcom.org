"use client";

import { DataTable } from "@/components/data-display/data-table";

interface RecentOrdersTableProps {
  data: unknown[];
}

/**
 * Client-boundary wrapper around DataTable for server-fetched order data.
 * DataTable's `columns` prop takes render functions, which can't cross the
 * Server->Client Component prop boundary (only serializable data can) — so
 * this component receives plain `data` from a Server Component parent and
 * defines the non-serializable `columns`/`cell` functions itself, inside
 * the client boundary.
 *
 * Field set matches what backend orders.list actually returns (see
 * orders.repository.ts) — it includes `assignment.staff` but NOT the
 * `client` relation, so there's no client name to show here without a
 * separate query. Flagging rather than fabricating a field that isn't there.
 */
export function RecentOrdersTable({ data }: RecentOrdersTableProps) {
  return (
    <DataTable
      data={data as any[]}
      isLoading={false}
      keyExtractor={(o: any) => o.id}
      emptyTitle="No recent orders"
      caption="Recent orders"
      columns={[
        { key: "orderNumber", header: "Order #", cell: (o: any) => <span className="font-mono text-xs">{o.orderNumber}</span> },
        { key: "service", header: "Service", cell: (o: any) => o.serviceType },
        { key: "status", header: "Status", cell: (o: any) => o.status },
        { key: "amount", header: "Amount", cell: (o: any) => `${o.currency} ${Number(o.totalAmount).toLocaleString()}` },
        { key: "date", header: "Placed", cell: (o: any) => new Date(o.createdAt).toLocaleDateString() },
      ]}
    />
  );
}
