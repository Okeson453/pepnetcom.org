"use client";
import { trpc } from "@/lib/trpc/client";

export function useAcademicOrders(input: { cursor?: string; limit?: number } = {}) {
  return trpc.academic.orders.list.useQuery(input);
}
export function useAcademicOrder(id: string) {
  return trpc.academic.orders.getById.useQuery({ id }, { enabled: Boolean(id) });
}
/** Public read — no auth required, matches the backend's publicProcedure guard. */
export function useAcademicSubjects() {
  return trpc.academic.subjects.list.useQuery();
}
export function useCreateAcademicSubject(options?: Parameters<typeof trpc.academic.subjects.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.academic.subjects.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.academic.subjects.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useUpdateAcademicSubject() {
  const utils = trpc.useUtils();
  return trpc.academic.subjects.update.useMutation({ onSuccess: () => utils.academic.subjects.list.invalidate() });
}
export function useAcademicAssignments() {
  return trpc.academic.assignments.list.useQuery();
}
export function useUpdateAssignmentStatus() {
  const utils = trpc.useUtils();
  return trpc.academic.assignments.updateStatus.useMutation({ onSuccess: () => utils.academic.assignments.list.invalidate() });
}
