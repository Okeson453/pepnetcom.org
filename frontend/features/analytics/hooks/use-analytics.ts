"use client";
import { trpc } from "@/lib/trpc/client";

export function useWebsiteAnalytics(input: { startDate?: Date; endDate?: Date } = {}) {
  return trpc.analytics.website.overview.useQuery(input);
}
export function useSalesAnalytics(input: { startDate?: Date; endDate?: Date } = {}) {
  return trpc.analytics.sales.overview.useQuery(input);
}
export function useSignalAnalytics(input: { startDate?: Date; endDate?: Date } = {}) {
  return trpc.analytics.signals.performance.useQuery(input);
}
/** Despite accepting cursor/limit input, listReports() actually returns a plain array. */
export function useAnalyticsReports(input: { cursor?: string; limit?: number } = {}) {
  return trpc.analytics.reports.list.useQuery(input);
}
export function useGenerateAnalyticsReport(options?: Parameters<typeof trpc.analytics.reports.generate.useMutation>[0]) {
  const utils = trpc.useUtils();
  return trpc.analytics.reports.generate.useMutation({
    ...options,
    onSuccess: (...args) => {
      utils.analytics.reports.list.invalidate();
      options?.onSuccess?.(...args);
    },
  });
}
