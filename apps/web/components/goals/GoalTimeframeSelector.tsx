"use client";

import type { GoalTimeframe } from "@uniflo/mock-data";

const timeframes: { value: GoalTimeframe; label: string }[] = [
  { value: "Q1", label: "Q1 2026" },
  { value: "Q2", label: "Q2 2026" },
  { value: "Q3", label: "Q3 2026" },
  { value: "Q4", label: "Q4 2026" },
  { value: "annual", label: "Annual" },
];

interface GoalTimeframeSelectorProps {
  value: GoalTimeframe;
  onChange: (value: GoalTimeframe) => void;
  className?: string;
}

export function GoalTimeframeSelector({
  value,
  onChange,
  className = "",
}: GoalTimeframeSelectorProps) {
  return (
    <div className={`inline-flex items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] ${className}`}>
      {timeframes.map((tf) => (
        <button
          key={tf.value}
          type="button"
          onClick={() => onChange(tf.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            value === tf.value
              ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
