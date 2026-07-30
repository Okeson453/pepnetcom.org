"use client";
import { trpc } from "@/lib/trpc/client";

export function useSiwesOrders(input: { cursor?: string; limit?: number } = {}) {
  return trpc.siwes.list.useQuery(input);
}
export function useSiwesOrder(id: string) {
  return trpc.siwes.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useAssignWriter(options?: Parameters<typeof trpc.siwes.assignWriter.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.siwes.assignWriter.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.siwes.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useUploadCompletedReport(options?: Parameters<typeof trpc.siwes.uploadCompletedReport.useMutation>[0]) {
  return trpc.siwes.uploadCompletedReport.useMutation(options);
}
export function useUpdateSiwesOrderDetails() {
  const utils = trpc.useUtils();
  return trpc.siwes.updateOrderDetails.useMutation({ onSuccess: () => utils.siwes.list.invalidate() });
}
