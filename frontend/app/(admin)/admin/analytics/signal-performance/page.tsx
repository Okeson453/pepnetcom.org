"use client";
import { StatCard } from "@/components/data-display/stat-card";
import { SignalLineChart } from "@/components/charts";
import { useSignalAnalytics } from "@/features/analytics";
export default function SignalPerformancePage() {
  const { data } = useSignalAnalytics();
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Signal Performance</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Accuracy" value={`${data?.accuracy ?? 0}%`} trend="up" />
        <StatCard label="Win Rate" value={`${data?.winRate ?? 0}%`} trend="up" />
        <StatCard label="Profit Factor" value="1.8" trend="up" />
      </div>
      <SignalLineChart data={[
        { time: "Mon", value: 72 }, { time: "Tue", value: 75 },
        { time: "Wed", value: 74 }, { time: "Thu", value: 78 },
        { time: "Fri", value: 80 }, { time: "Sat", value: 79 }, { time: "Sun", value: 82 },
      ]} />
    </div>);
}
