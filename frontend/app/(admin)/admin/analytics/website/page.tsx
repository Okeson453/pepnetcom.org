"use client";
import { StatCard } from "@/components/data-display/stat-card";
import { AnalyticsBarChart } from "@/components/charts";
import { useWebsiteAnalytics } from "@/features/analytics";
export default function WebsiteAnalyticsPage() {
  const { data } = useWebsiteAnalytics();
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Website Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Visitors" value={data?.visitors ?? 0} />
        <StatCard label="Page Views" value={data?.pageViews ?? 0} />
        <StatCard label="Bounce Rate" value="42%" trend="down" trendValue="-3%" />
      </div>
      <AnalyticsBarChart data={[
        { label: "Mon", value: 120 }, { label: "Tue", value: 180 },
        { label: "Wed", value: 150 }, { label: "Thu", value: 220 },
        { label: "Fri", value: 260 }, { label: "Sat", value: 190 }, { label: "Sun", value: 140 },
      ]} />
    </div>);
}
