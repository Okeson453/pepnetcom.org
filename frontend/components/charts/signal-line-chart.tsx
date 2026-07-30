"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface SignalLineChartPoint {
  time: string;
  value: number;
}

interface SignalLineChartProps {
  data: SignalLineChartPoint[];
  /** Height in px. Defaults to 220. */
  height?: number;
}

function SignalLineChartTooltip({
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
      <div className="text-teal">{payload[0].value}</div>
    </div>
  );
}

/**
 * Line chart for signal accuracy/performance trends over time. Uses the
 * brand's teal accent and hairline gridlines — no drop shadows, per the
 * design system.
 */
export function SignalLineChart({ data, height = 220 }: SignalLineChartProps) {
  return (
    <div style={{ width: "100%", height }} role="img" aria-label="Signal performance over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="0" vertical={false} />
          <XAxis
            dataKey="time"
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
            width={32}
          />
          <Tooltip content={<SignalLineChartTooltip />} cursor={{ stroke: "var(--teal)", strokeOpacity: 0.2 }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--teal)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--teal)", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "var(--teal)", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
