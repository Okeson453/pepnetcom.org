"use client";

import { useEffect, useRef, useState } from "react";
import { usePulseAnimation } from "@/hooks/use-pulse-animation";

interface PulseLineProps {
  variant?: "hero" | "nav" | "chart";
  className?: string;
}

const PATH_D = "M20,100 L120,100 L155,30 L190,110 L230,60 L270,100 L400,100 L440,50 L475,120 L510,70 L550,100 L680,100 L715,40 L750,110 L790,65 L830,100 L900,100";
const NODES = [
  { cx: 120, cy: 100, label: "SIWES" },
  { cx: 270, cy: 100, label: "ACADEMIC" },
  { cx: 400, cy: 100, label: "TRADE" },
  { cx: 550, cy: 100, label: "EDU CONSULT" },
  { cx: 680, cy: 100, label: "MARKETING" },
  { cx: 830, cy: 100, label: "SIGNALS" },
];

export function PulseLine({ variant = "hero", className = "" }: PulseLineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const { prefersReducedMotion: prefersReduced } = usePulseAnimation();
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (!pathRef.current || prefersReduced) return;
    const length = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = String(length);
    pathRef.current.style.strokeDashoffset = String(length);
    pathRef.current.getBoundingClientRect();
    pathRef.current.style.transition = "stroke-dashoffset 2.2s ease";
    pathRef.current.style.strokeDashoffset = "0";
    const timer = setTimeout(() => setDrawn(true), 2200);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  if (variant === "nav") {
    return (
      <svg viewBox="0 0 120 4" className={`w-full h-1 ${className}`} preserveAspectRatio="none">
        <path d="M0,2 L120,2" fill="none" stroke="#E7A63C" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 920 140" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        <path
          ref={pathRef}
          d={PATH_D}
          fill="none"
          stroke="#E7A63C"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={prefersReduced ? { strokeDashoffset: 0 } : undefined}
        />
        {NODES.map((node, i) => (
          <g key={i} className="origin-center">
            {!prefersReduced && drawn && (
              <circle
                cx={node.cx}
                cy={node.cy}
                r="10"
                fill="none"
                stroke="#E7A63C"
                strokeWidth="2"
                opacity="0"
                style={{
                  animation: `pingring 1.6s ease-out ${0.15 + i * 0.3}s 1 forwards`,
                }}
              />
            )}
            <circle
              cx={node.cx}
              cy={node.cy}
              r="6"
              fill="#ECE8DD"
              stroke="#E7A63C"
              strokeWidth="2.5"
            />
          </g>
        ))}
      </svg>
      {variant === "hero" && (
        <div className="grid grid-cols-6 gap-1 max-w-[920px] mx-auto mt-2">
          {NODES.map((node, i) => (
            <span key={i} className="font-mono text-[11px] opacity-60 text-center">
              {node.label}
            </span>
          ))}
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pingring {
            0% { opacity: 0.9; transform: scale(0.6); }
            100% { opacity: 0; transform: scale(2.2); }
          }
        `
      }} />
    </div>
  );
}
