"use client";

import type { GoalHealthStatus } from "@uniflo/mock-data";

const healthConfig: Record<GoalHealthStatus, { label: string; dotClass: string; pillClass: string }> = {
  on_track: {
    label: "On Track",
    dotClass: "bg-[var(--accent-green)]",
    pillClass: "bg-[var(--accent-green)]/10 text-[var(--accent-green)]",
  },
  at_risk: {
    label: "At Risk",
    dotClass: "bg-yellow-400",
    pillClass: "bg-yellow-500/10 text-yellow-400",
  },
  behind: {
    label: "Behind",
    dotClass: "bg-[var(--accent-red)]",
    pillClass: "bg-[var(--accent-red)]/10 text-[var(--accent-red)]",
  },
  achieved: {
    label: "Achieved",
    dotClass: "bg-[var(--accent-blue)]",
    pillClass: "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]",
  },
};

interface GoalStatusChipProps {
  health: GoalHealthStatus;
  className?: string;
}

export function GoalStatusChip({ health, className = "" }: GoalStatusChipProps) {
  const config = healthConfig[health];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.pillClass} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dotClass}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}
