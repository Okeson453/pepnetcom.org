import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "up" | "down" | "pending" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium transition-colors",
        {
          "bg-amber/15 text-amber": variant === "default",
          "bg-teal/15 text-teal": variant === "up",
          "bg-rust/15 text-rust": variant === "down",
          "bg-amber/10 text-amber-bright": variant === "pending",
          "border border-graphite/20 text-graphite": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
