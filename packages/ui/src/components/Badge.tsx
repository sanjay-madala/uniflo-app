import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-primary)]",
        success: "border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 text-[var(--accent-green)]",
        destructive: "border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10 text-[var(--accent-red)]",
        warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
        blue: "border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
