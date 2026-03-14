"use client";

import type { KeyResult } from "@uniflo/mock-data";
import { GoalProgressBar } from "./GoalProgressBar";
import { GoalStatusChip } from "./GoalStatusChip";
import { AutoUpdateBadge } from "./AutoUpdateBadge";

interface KeyResultRowProps {
  kr: KeyResult;
  onClick?: () => void;
}

function formatValue(value: number, unit: string): string {
  switch (unit) {
    case "percent":
      return `${value}%`;
    case "currency":
      return `$${value.toLocaleString()}`;
    case "boolean":
      return value ? "Yes" : "No";
    case "score":
      return value.toFixed(1);
    default:
      return String(value);
  }
}

export function KeyResultRow({ kr, onClick }: KeyResultRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-start rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <AutoUpdateBadge
            trackingType={kr.tracking_type}
            moduleLabel={kr.data_source_module ? kr.data_source_module.charAt(0).toUpperCase() + kr.data_source_module.slice(1) : undefined}
          />
          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
            {kr.title}
          </span>
        </div>
        <GoalStatusChip health={kr.health} />
      </div>
      <GoalProgressBar
        progress={kr.progress_pct}
        health={kr.health}
        label={`${kr.title}: ${kr.progress_pct}%`}
      />
      <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
        <span>{formatValue(kr.current_value, kr.unit)} / {formatValue(kr.target_value, kr.unit)}</span>
        <span className="capitalize">{kr.direction}</span>
      </div>
    </button>
  );
}
