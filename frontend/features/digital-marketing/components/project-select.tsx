"use client";

import { useMarketingProjects } from "@/features/digital-marketing";

interface ProjectSelectProps {
  value: string;
  onChange: (projectId: string) => void;
}

/**
 * Campaigns, reports, and deliverables are all strictly scoped to one
 * marketing project on the real backend (campaignListSchema/
 * reportGenerateSchema/deliverableListSchema all require projectId) —
 * shared across those 3 pages instead of repeating the same project
 * dropdown three times.
 */
export function ProjectSelect({ value, onChange }: ProjectSelectProps) {
  const { data, isLoading } = useMarketingProjects();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className="flex w-full max-w-xs rounded-md border border-graphite/15 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber disabled:opacity-50"
    >
      <option value="">{isLoading ? "Loading projects..." : "Select a project"}</option>
      {data?.items.map((p: any) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
  );
}
