"use client";
import { trpc } from "@/lib/trpc/client";

export function useMarketingProjects(input: { cursor?: string; limit?: number } = {}) {
  return trpc.marketing.projects.list.useQuery(input);
}
export function useMarketingProject(id: string) {
  return trpc.marketing.projects.getById.useQuery({ id }, { enabled: Boolean(id) });
}
export function useCreateMarketingProject() {
  const utils = trpc.useUtils();
  return trpc.marketing.projects.create.useMutation({ onSuccess: () => utils.marketing.projects.list.invalidate() });
}
export function useMarketingCampaigns(projectId: string, input: { cursor?: string; limit?: number } = {}) {
  return trpc.marketing.campaigns.list.useQuery({ projectId, ...input }, { enabled: Boolean(projectId) });
}
export function useCreateCampaign(options?: Parameters<typeof trpc.marketing.campaigns.create.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.marketing.campaigns.create.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.marketing.campaigns.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
export function useUpdateCampaign() {
  const utils = trpc.useUtils();
  return trpc.marketing.campaigns.update.useMutation({ onSuccess: () => utils.marketing.campaigns.list.invalidate() });
}
/** Despite accepting cursor/limit input, listReports() actually returns a plain array — the service doesn't paginate the result. */
export function useMarketingReports(projectId: string, input: { cursor?: string; limit?: number } = {}) {
  return trpc.marketing.reports.list.useQuery({ projectId, ...input }, { enabled: Boolean(projectId) });
}
export function useGenerateMarketingReport(options?: Parameters<typeof trpc.marketing.reports.generate.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.marketing.reports.generate.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.marketing.reports.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
/** Despite accepting cursor/limit input, listDeliverables() actually returns a plain array — same as reports above. */
export function useMarketingDeliverables(projectId: string, input: { cursor?: string; limit?: number } = {}) {
  return trpc.marketing.deliverables.list.useQuery({ projectId, ...input }, { enabled: Boolean(projectId) });
}
export function useUploadDeliverable(options?: Parameters<typeof trpc.marketing.deliverables.upload.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.marketing.deliverables.upload.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.marketing.deliverables.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
