"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { usePaymentGateways, useUpdateGateway } from "@/features/payments";

// NOTE: gateways.list is NOT cursor-paginated (returns a plain array — see
// payments.service.ts's listGateways()), unlike most other list endpoints,
// so `data ?? []` here is correct as-is. gateways.update takes
// { gateway, isActive?, config? } — there's no `id` field at all, and
// status is a real `isActive` boolean, not an "ACTIVE"/"INACTIVE" string.
export default function PaymentGatewaysPage() {
  const { data, isLoading } = usePaymentGateways();
  const mutation = useUpdateGateway();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Payment Gateways</h1>
      <DataTable
        data={data ?? []}
        isLoading={isLoading}
        keyExtractor={(g: any) => g.gateway}
        emptyTitle="No gateways configured"
        caption="Payment gateways"
        columns={[
          { key: "name", header: "Gateway", cell: (g: any) => g.gateway },
          { key: "status", header: "Status", cell: (g: any) => (g.isActive ? "Active" : "Inactive") },
          {
            key: "action",
            header: "",
            cell: (g: any) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => mutation.mutate({ gateway: g.gateway, isActive: !g.isActive })}
              >
                Toggle
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
