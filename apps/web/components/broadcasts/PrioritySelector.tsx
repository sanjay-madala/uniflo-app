"use client";

import type { BroadcastPriority } from "@uniflo/mock-data";

const priorities: { value: BroadcastPriority; label: string; color: string }[] = [
  { value: "normal", label: "Normal", color: "var(--text-muted)" },
  { value: "urgent", label: "Urgent", color: "var(--accent-yellow)" },
  { value: "critical", label: "Critical", color: "var(--accent-red)" },
];

interface PrioritySelectorProps {
  value: BroadcastPriority;
  onChange: (priority: BroadcastPriority) => void;
}

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--text-secondary)]">Priority</label>
      <div className="flex gap-2">
        {priorities.map((p) => {
          const isActive = value === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className="flex-1 rounded-md border px-3 py-2 text-xs font-medium transition-colors"
              style={{
                borderColor: isActive ? p.color : "var(--border-default)",
                backgroundColor: isActive ? `color-mix(in srgb, ${p.color} 10%, transparent)` : "transparent",
                color: isActive ? p.color : "var(--text-secondary)",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
