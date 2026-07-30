"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface AnalyticsBarChartPoint {
  label: string;
  value: number;
}

interface AnalyticsBarChartProps {
  data: AnalyticsBarChartPoint[];
  /** Height in px. Defaults to 260. */
  height?: number;
}

function AnalyticsBarChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-graphite/10 bg-bone px-3 py-2 text-xs font-mono shadow-none">
      <div className="opacity-50">{label}</div>
      <div className="text-amber">{payload[0].value.toLocaleString()}</div>
    </div>
  );
}

/**
 * Bar chart for period-over-period metrics (sales revenue, website traffic).
 * Uses the brand's amber accent and hairline gridlines — no drop shadows,
 * per the design system.
 */
export function AnalyticsBarChart({ data, height = 260 }: AnalyticsBarChartProps) {
  return (
    <div style={{ width: "100%", height }} role="img" aria-label="Analytics by period">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--graphite)"
            strokeOpacity={0.4}
            fontSize={11}
            fontFamily="var(--font-ibm-plex-mono), monospace"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--graphite)"
            strokeOpacity={0.4}
            fontSize={11}
            fontFamily="var(--font-ibm-plex-mono), monospace"
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<AnalyticsBarChartTooltip />} cursor={{ fill: "var(--amber)", fillOpacity: 0.08 }} />
          <Bar dataKey="value" fill="var(--amber)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
