"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormControlProps {
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  [key: string]: unknown;
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactElement<FormControlProps>;
  className?: string;
  /** Shows a red asterisk next to the label for mandatory fields. Purely visual — actual validation lives in the form's zod schema. */
  required?: boolean;
}

/**
 * Wraps a single form control, generating a stable id and wiring up
 * `htmlFor` / `id` / `aria-describedby` / `aria-invalid` so screen readers
 * programmatically associate the label (and any error text) with the
 * control, instead of relying on visual adjacency alone.
 */
export function FormField({ label, error, children, className, required }: FormFieldProps) {
  const generatedId = React.useId();
  const childId = children.props.id ?? generatedId;
  const errorId = error ? `${childId}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={childId} className={cn(error && "text-rust")}>
        {label}
        {required && (
          <span className="text-rust ml-0.5" aria-hidden="true">*</span>
        )}
      </Label>
      {React.cloneElement(children, {
        id: childId,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": errorId ?? children.props["aria-describedby"],
        className: cn(
          children.props.className as string,
          error && "border-rust focus-visible:ring-rust"
        ),
      })}
      {error && (
        <p id={errorId} className="text-xs text-rust">
          {error}
        </p>
      )}
    </div>
  );
}
