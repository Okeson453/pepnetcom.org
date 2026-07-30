"use client";
import { trpc } from "@/lib/trpc/client";

/** Public read — no auth required (matches backend's publicProcedure guard on list/getById). */
export function useTradeStrategies(input: { cursor?: string; limit?: number } = {}) {
  return trpc.strategies.list.useQuery(input);
}
export function useTradeStrategy(id: string) {
  return trpc.strategies.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useCreateTradeStrategy(options?: Parameters<typeof trpc.strategies.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.strategies.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.strategies.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useUpdateTradeStrategy(options?: Parameters<typeof trpc.strategies.update.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.strategies.update.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.strategies.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useDeleteTradeStrategy() {
  const utils = trpc.useUtils();
  return trpc.strategies.delete.useMutation({ onSuccess: () => utils.strategies.list.invalidate() });
}
/** Client-only — purchasing a strategy. */
export function usePurchaseTradeStrategy() {
  const utils = trpc.useUtils();
  return trpc.strategies.purchase.useMutation({ onSuccess: () => utils.strategies.myPurchases.invalidate() });
}
export function useMyStrategyPurchases() {
  return trpc.strategies.myPurchases.useQuery();
}
export function useTradeStrategySalesReport() {
  return trpc.strategies.salesReport.useQuery();
}
