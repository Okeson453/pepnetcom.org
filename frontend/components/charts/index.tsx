"use client";

import dynamic from "next/dynamic";

/**
 * recharts is a large dependency (~100KB+ gzipped with its D3 sub-deps).
 * Loading it via next/dynamic with ssr:false code-splits it into its own
 * chunk that's only fetched when a page that actually renders a chart is
 * visited, instead of bloating the shared client bundle for every page.
 * ssr:false is safe here since ResponsiveContainer measures the DOM and
 * has no meaningful server-rendered output anyway.
 */
export const SignalLineChart = dynamic(
  () => import("./signal-line-chart").then((mod) => mod.SignalLineChart),
  {
    ssr: false,
    loading: () => <div className="h-[220px] w-full animate-pulse rounded-lg bg-graphite/5" />,
  }
);

export const AnalyticsBarChart = dynamic(
  () => import("./analytics-bar-chart").then((mod) => mod.AnalyticsBarChart),
  {
    ssr: false,
    loading: () => <div className="h-[260px] w-full animate-pulse rounded-lg bg-graphite/5" />,
  }
);
