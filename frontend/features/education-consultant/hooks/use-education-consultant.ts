"use client";
import { trpc } from "@/lib/trpc/client";

export function useConsultantRequests(input: { cursor?: string; limit?: number; status?: string } = {}) {
  return trpc.consultant.requests.list.useQuery(input);
}
/** Public — matches backend's publicProcedure guard (anonymous consultation requests allowed). */
export function useCreateConsultantRequest(options?: Parameters<typeof trpc.consultant.requests.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.consultant.requests.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.consultant.requests.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useUpdateConsultantRequestStatus() {
  const utils = trpc.useUtils();
  return trpc.consultant.requests.updateStatus.useMutation({ onSuccess: () => utils.consultant.requests.list.invalidate() });
}
export function useConsultantApplications(input: { cursor?: string; limit?: number } = {}) {
  return trpc.consultant.applications.list.useQuery(input);
}
export function useConsultantApplication(id: string) {
  return trpc.consultant.applications.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useUpdateApplicationStatus() {
  const utils = trpc.useUtils();
  return trpc.consultant.applications.updateStatus.useMutation({ onSuccess: () => utils.consultant.applications.list.invalidate() });
}
/** Public read. */
export function useUniversities() {
  return trpc.consultant.universities.list.useQuery();
}
export function useCreateUniversity(options?: Parameters<typeof trpc.consultant.universities.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.consultant.universities.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.consultant.universities.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
/** Public read. */
export function useCountries() {
  return trpc.consultant.countries.list.useQuery();
}
export function useCreateCountry(options?: Parameters<typeof trpc.consultant.countries.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.consultant.countries.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.consultant.countries.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
