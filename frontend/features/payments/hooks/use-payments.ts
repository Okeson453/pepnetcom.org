"use client";
import { trpc } from "@/lib/trpc/client";

/** Starts a real checkout — backend calls out to the configured gateway and returns a redirect URL. */
export function useInitiatePayment() {
  return trpc.payments.initiate.useMutation();
}
/** Confirms a payment client-side after gateway redirect back (in addition to the backend's own webhook confirmation). */
export function useVerifyPayment() {
  return trpc.payments.verify.useMutation();
}
export function useTransactions(input: { cursor?: string; limit?: number } = {}) {
  return trpc.payments.transactions.list.useQuery(input);
}
export function useTransaction(id: string) {
  return trpc.payments.transactions.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useInvoices(input: { cursor?: string; limit?: number } = {}) {
  return trpc.payments.invoices.list.useQuery(input);
}
export function useInvoice(id: string) {
  return trpc.payments.invoices.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useRequestRefund() {
  const utils = trpc.useUtils();
  return trpc.payments.refunds.request.useMutation({ onSuccess: () => utils.payments.refunds.list.invalidate() });
}
/** Requires the payments:admin permission (permissionProcedure), not just any admin. */
export function useRefunds() {
  return trpc.payments.refunds.list.useQuery();
}
export function useUpdateRefundStatus() {
  const utils = trpc.useUtils();
  return trpc.payments.refunds.updateStatus.useMutation({ onSuccess: () => utils.payments.refunds.list.invalidate() });
}
export function usePaymentGateways() {
  return trpc.payments.gateways.list.useQuery();
}
export function useUpdateGateway() {
  const utils = trpc.useUtils();
  return trpc.payments.gateways.update.useMutation({ onSuccess: () => utils.payments.gateways.list.invalidate() });
}
export function useCreateSubscription() {
  const utils = trpc.useUtils();
  return trpc.payments.subscriptions.create.useMutation({ onSuccess: () => utils.payments.subscriptions.list.invalidate() });
}
/** Despite accepting cursor/limit input, listSubscriptions() actually returns a plain array — no pagination applied server-side. */
export function useSubscriptions(input: { cursor?: string; limit?: number } = {}) {
  return trpc.payments.subscriptions.list.useQuery(input);
}
export function useCancelSubscription() {
  const utils = trpc.useUtils();
  return trpc.payments.subscriptions.cancel.useMutation({ onSuccess: () => utils.payments.subscriptions.list.invalidate() });
}
