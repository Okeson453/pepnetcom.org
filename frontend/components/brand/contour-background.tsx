interface ContourBackgroundProps {
  variant?: "bone" | "ink";
  className?: string;
}

export function ContourBackground({ variant = "bone", className = "" }: ContourBackgroundProps) {
  const stroke = variant === "ink" ? "#ECE8DD" : "#1C2230";
  const opacity = variant === "ink" ? "0.07" : "0.045";

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cg fill='none' stroke='${encodeURIComponent(stroke)}' stroke-width='1'%3E%3Cpath d='M-20 60 Q 100 20, 220 60 T 440 60'/%3E%3Cpath d='M-20 100 Q 100 60, 220 100 T 440 100'/%3E%3Cpath d='M-20 140 Q 100 190, 220 140 T 440 140'/%3E%3Cpath d='M-20 200 Q 120 140, 240 200 T 460 200'/%3E%3Cpath d='M-20 260 Q 120 320, 240 260 T 460 260'/%3E%3Cpath d='M-20 320 Q 120 280, 240 320 T 460 320'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: "500px 500px",
        opacity,
      }}
    />
  );
}
