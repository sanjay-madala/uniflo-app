"use client";

import type { BroadcastStatus } from "@uniflo/mock-data";

const statusConfig: Record<BroadcastStatus, { label: string; bg: string; text: string }> = {
  sent: { label: "Sent", bg: "var(--accent-green)", text: "var(--accent-green)" },
  scheduled: { label: "Scheduled", bg: "var(--accent-blue)", text: "var(--accent-blue)" },
  draft: { label: "Draft", bg: "var(--text-muted)", text: "var(--text-muted)" },
  failed: { label: "Failed", bg: "var(--accent-red)", text: "var(--accent-red)" },
};

export function BroadcastStatusChip({ status }: { status: BroadcastStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `color-mix(in srgb, ${config.bg} 15%, transparent)`,
        color: config.text,
      }}
    >
      {config.label}
    </span>
  );
}
