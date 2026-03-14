"use client";

import type { BroadcastPriority } from "@uniflo/mock-data";

const config: Record<BroadcastPriority, { label: string; bg: string; text: string }> = {
  normal: { label: "Normal", bg: "var(--text-muted)", text: "var(--text-muted)" },
  urgent: { label: "Urgent", bg: "var(--accent-yellow)", text: "var(--accent-yellow)" },
  critical: { label: "Critical", bg: "var(--accent-red)", text: "var(--accent-red)" },
};

export function BroadcastPriorityBadge({ priority }: { priority: BroadcastPriority }) {
  const c = config[priority];
  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${c.bg} 15%, transparent)`,
        color: c.text,
      }}
    >
      {c.label}
    </span>
  );
}
