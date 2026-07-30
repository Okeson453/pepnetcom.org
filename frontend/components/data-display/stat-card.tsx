import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({ label, value, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={cn("bg-ink border border-bone/10 rounded-lg p-4", className)}>
      <div className="text-[11px] font-mono opacity-50 mb-1.5 uppercase tracking-wider">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className={cn(
          "font-mono text-xl font-medium",
          trend === "up" ? "text-teal" : trend === "down" ? "text-rust" : "text-bone"
        )}>
          {value}
        </span>
        {trendValue && (
          <span className={cn(
            "text-xs font-mono",
            trend === "up" ? "text-teal" : trend === "down" ? "text-rust" : "text-bone/50"
          )}>
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
