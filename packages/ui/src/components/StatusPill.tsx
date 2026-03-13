import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const statusPillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      status: {
        open: "bg-[var(--accent-green)]/10 text-[var(--accent-green)]",
        closed: "bg-[var(--bg-tertiary)] text-[var(--text-muted)]",
        pending: "bg-yellow-500/10 text-yellow-400",
        critical: "bg-[var(--accent-red)]/10 text-[var(--accent-red)]",
        info: "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]",
      },
    },
    defaultVariants: { status: "info" },
  }
);

const DOT_COLORS: Record<string, string> = {
  open: "bg-[var(--accent-green)]",
  closed: "bg-[var(--text-muted)]",
  pending: "bg-yellow-400",
  critical: "bg-[var(--accent-red)]",
  info: "bg-[var(--accent-blue)]",
};

export interface StatusPillProps extends VariantProps<typeof statusPillVariants> {
  label?: string;
  dot?: boolean;
  className?: string;
}

export function StatusPill({ status, label, dot = true, className }: StatusPillProps) {
  const statusKey = status ?? "info";
  const displayLabel = label ?? String(statusKey).charAt(0).toUpperCase() + String(statusKey).slice(1);

  return (
    <span className={cn(statusPillVariants({ status }), className)} role="status">
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", DOT_COLORS[statusKey as string])} aria-hidden="true" />
      )}
      {displayLabel}
    </span>
  );
}
