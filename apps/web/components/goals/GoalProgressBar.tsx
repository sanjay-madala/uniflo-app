"use client";

import type { GoalHealthStatus } from "@uniflo/mock-data";

const healthColors: Record<GoalHealthStatus, string> = {
  on_track: "var(--accent-green)",
  at_risk: "var(--accent-yellow)",
  behind: "var(--accent-red)",
  achieved: "var(--accent-blue)",
};

interface GoalProgressBarProps {
  progress: number;
  health: GoalHealthStatus;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function GoalProgressBar({
  progress,
  health,
  label,
  showLabel = true,
  className = "",
}: GoalProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const color = healthColors[health];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-1 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? `Progress: ${clampedProgress}%`}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedProgress}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums w-10 text-end shrink-0">
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}
