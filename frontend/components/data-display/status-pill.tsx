import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "up" | "down" | "pending" | "closed" | "active";
  children: React.ReactNode;
  className?: string;
}

export function StatusPill({ status, children, className }: StatusPillProps) {
  const styles = {
    up: "bg-teal/15 text-teal",
    down: "bg-rust/15 text-rust",
    pending: "bg-amber/15 text-amber-bright",
    closed: "bg-teal/15 text-teal",
    active: "bg-amber/15 text-amber-bright",
  };

  return (
    <span className={cn("inline-block px-2 py-0.5 rounded-full text-[11px] font-mono font-medium", styles[status], className)}>
      {children}
    </span>
  );
}
