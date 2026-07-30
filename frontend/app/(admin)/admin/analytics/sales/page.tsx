"use client";
import { StatCard } from "@/components/data-display/stat-card";
import { AnalyticsBarChart } from "@/components/charts";
import { useSalesAnalytics } from "@/features/analytics";
export default function SalesAnalyticsPage() {
  const { data } = useSalesAnalytics();
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Sales Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Revenue" value={`₦${data?.revenue ?? 0}`} trend="up" trendValue="+15%" />
        <StatCard label="Orders" value={data?.orders ?? 0} trend="up" trendValue="+8%" />
        <StatCard label="Avg. Order" value="₦12,500" />
      </div>
      <AnalyticsBarChart data={[
        { label: "Week 1", value: 45000 }, { label: "Week 2", value: 52000 },
        { label: "Week 3", value: 48000 }, { label: "Week 4", value: 61000 },
      ]} />
    </div>);
}
