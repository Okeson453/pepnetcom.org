"use client";
import { trpc } from "@/lib/trpc/client";

/** Requires CLIENT or ADMIN role (clientProcedure) — signals are a paid/subscriber feature, not public. */
export function useSignals(input: { cursor?: string; limit?: number } = {}) {
  return trpc.signals.list.useQuery(input);
}
export function useSignal(id: string) {
  return trpc.signals.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useCreateSignal(options?: Parameters<typeof trpc.signals.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.signals.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.signals.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useCloseSignal() {
  const utils = trpc.useUtils();
  return trpc.signals.close.useMutation({ onSuccess: () => utils.signals.list.invalidate() });
}
export function useSignalHistory(input: { cursor?: string; limit?: number } = {}) {
  return trpc.signals.history.useQuery(input);
}
export function useSignalPerformanceStats() {
  return trpc.signals.performanceStats.useQuery();
}
export function useSignalSubscribers() {
  return trpc.signals.subscribers.list.useQuery();
}
export function useUpdateSubscriberStatus() {
  const utils = trpc.useUtils();
  return trpc.signals.subscribers.updateStatus.useMutation({ onSuccess: () => utils.signals.subscribers.list.invalidate() });
}
export function useSubscribeToSignals() {
  return trpc.signals.subscribers.subscribe.useMutation();
}
