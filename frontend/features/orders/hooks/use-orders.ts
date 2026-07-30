"use client";

import { trpc } from "@/lib/trpc/client";

/** List the current user's (or, on admin pages, all) orders with cursor pagination. */
export function useOrders(input: { cursor?: string; limit?: number } = {}) {
  return trpc.orders.list.useQuery(input);
}

export function useOrder(id: string) {
  return trpc.orders.getById.useQuery({ id }, { enabled: Boolean(id) });
}

export function useCreateOrder(options?: Parameters<typeof trpc.orders.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.orders.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.orders.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}

export function useOrderTrackingTimeline(id: string) {
  return trpc.orders.trackingTimeline.useQuery({ id }, { enabled: Boolean(id) });
}

export function useAssignStaff() {
  const utils = trpc.useUtils();
  return trpc.orders.assignStaff.useMutation({
    onSuccess: () => utils.orders.list.invalidate(),
  });
}

/** New — real backend has this, the old mock router didn't. Writer marks progress on an assigned order. */
export function useUpdateOrderStatus() {
  const utils = trpc.useUtils();
  return trpc.orders.updateStatus.useMutation({
    onSuccess: () => utils.orders.list.invalidate(),
  });
}

/** New — real backend has this, the old mock router didn't. */
export function useCancelOrder() {
  const utils = trpc.useUtils();
  return trpc.orders.cancel.useMutation({
    onSuccess: () => utils.orders.list.invalidate(),
  });
}
