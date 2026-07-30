"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  content: React.ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  onSubmit: () => void;
  className?: string;
  /** Controlled current step index. Omit to manage step state internally. */
  currentStep?: number;
  /** Called whenever the step changes, whether controlled or uncontrolled. */
  onStepChange?: (step: number) => void;
  /** Disables Back/Continue/Submit and shows a pending label on Submit while an async onSubmit chain is in flight. */
  submitting?: boolean;
}

export function MultiStepForm({ steps, onSubmit, className, currentStep, onStepChange, submitting }: MultiStepFormProps) {
  const [internalStep, setInternalStep] = useState(0);
  const isControlled = currentStep !== undefined;
  const current = isControlled ? currentStep : internalStep;

  const goTo = (step: number) => {
    const clamped = Math.max(0, Math.min(steps.length - 1, step));
    if (!isControlled) setInternalStep(clamped);
    onStepChange?.(clamped);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-medium",
              i <= current ? "bg-amber text-ink" : "bg-graphite/10 text-graphite/50"
            )}>
              {i + 1}
            </div>
            <span className={cn("text-xs hidden sm:block", i <= current ? "text-graphite" : "text-graphite/40")}>
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-[1px]", i < current ? "bg-amber" : "bg-graphite/10")} />
            )}
          </div>
        ))}
      </div>
      <div className="py-4">{steps[current].content}</div>
      <div className="flex justify-between pt-4 border-t border-graphite/10">
        <Button variant="secondary" onClick={() => goTo(current - 1)} disabled={current === 0 || submitting}>
          Back
        </Button>
        {current < steps.length - 1 ? (
          <Button onClick={() => goTo(current + 1)} disabled={submitting}>Continue</Button>
        ) : (
          <Button onClick={onSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
        )}
      </div>
    </div>
  );
}
