"use client";

import type { Subtask } from "@uniflo/mock-data";

interface SubtaskProgressBarProps {
  subtasks: Subtask[];
  size?: "sm" | "md";
  showPercent?: boolean;
}

export function SubtaskProgressBar({ subtasks, size = "sm", showPercent = false }: SubtaskProgressBarProps) {
  const total = subtasks.length;
  if (total === 0) return null;

  const done = subtasks.filter(s => s.status === "done").length;
  const percent = Math.round((done / total) * 100);

  const barHeight = size === "sm" ? "h-1.5" : "h-2";
  const barColor =
    percent === 100
      ? "bg-[var(--accent-green)]"
      : percent > 0
        ? "bg-[var(--accent-blue)]"
        : "bg-[var(--text-muted)]";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[var(--text-secondary)] shrink-0">
        {done}/{total}
      </span>
      <div className={`flex-1 ${barHeight} rounded-full bg-[var(--bg-tertiary)]`}>
        <div
          className={`${barHeight} rounded-full ${barColor} transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showPercent && (
        <span className="text-xs text-[var(--text-secondary)] shrink-0">{percent}%</span>
      )}
    </div>
  );
}
