"use client";

import type { DateRangePreset } from "@uniflo/mock-data";

interface DashboardDateRangePickerProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
}

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "last_7_days", label: "7d" },
  { key: "last_30_days", label: "30d" },
  { key: "last_90_days", label: "90d" },
  { key: "this_quarter", label: "QTD" },
];

export function DashboardDateRangePicker({ preset, onPresetChange }: DashboardDateRangePickerProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-0.5">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => onPresetChange(p.key)}
          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
            preset === p.key
              ? "bg-[var(--accent-blue)] text-white"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
