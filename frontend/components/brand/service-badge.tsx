import { cn } from "@/lib/utils";

const SERVICE_CONFIG = {
  siwes: { label: "SIWES", bg: "rgba(177,75,44,0.14)", color: "#B14B2C" },
  academic: { label: "ACADEMIC", bg: "rgba(46,154,140,0.14)", color: "#2E9A8C" },
  trade: { label: "TRADE", bg: "rgba(231,166,60,0.16)", color: "#8a5a15" },
  education: { label: "EDUCATION", bg: "rgba(127,184,174,0.22)", color: "#256359" },
  marketing: { label: "MARKETING", bg: "rgba(201,138,75,0.2)", color: "#8a5a15" },
  signals: { label: "SIGNALS", bg: "rgba(240,184,92,0.22)", color: "#8a5a15" },
} as const;

type ServiceKey = keyof typeof SERVICE_CONFIG;

interface ServiceBadgeProps {
  service: ServiceKey;
  className?: string;
}

export function ServiceBadge({ service, className }: ServiceBadgeProps) {
  const config = SERVICE_CONFIG[service];
  return (
    <span
      className={cn(
        "inline-block font-mono text-[11px] px-2 py-1 rounded",
        className
      )}
      style={{ background: config.bg, color: config.color }}
    >
      {config.label}
    </span>
  );
}

export { SERVICE_CONFIG };
export type { ServiceKey };
