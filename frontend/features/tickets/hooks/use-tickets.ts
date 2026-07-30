"use client";
import { trpc } from "@/lib/trpc/client";

export function useSupportTickets(input: { cursor?: string; limit?: number } = {}) {
  return trpc.tickets.list.useQuery(input);
}
export function useSupportTicket(id: string) {
  return trpc.tickets.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useCreateSupportTicket(options?: Parameters<typeof trpc.tickets.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.tickets.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.tickets.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useReplyToTicket() {
  const utils = trpc.useUtils();
  return trpc.tickets.reply.useMutation({ onSuccess: () => utils.tickets.list.invalidate() });
}
export function useUpdateTicketStatus() {
  const utils = trpc.useUtils();
  return trpc.tickets.updateStatus.useMutation({ onSuccess: () => utils.tickets.list.invalidate() });
}
