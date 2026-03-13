import * as React from "react";
import { cn } from "../lib/utils";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function LoadingSpinner({ size = "md", className, label = "Loading…" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)} role="status" aria-label={label}>
      <div
        className={cn(
          "rounded-full border-[var(--border-default)] border-t-[var(--accent-blue)] animate-spin",
          sizeClasses[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
