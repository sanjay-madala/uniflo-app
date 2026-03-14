"use client";

import type { SLAPolicyStatus } from "@uniflo/mock-data";

const statusConfig: Record<SLAPolicyStatus, { label: string; bg: string; text: string }> = {
  active: {
    label: "Active",
    bg: "var(--accent-green)",
    text: "#fff",
  },
  paused: {
    label: "Paused",
    bg: "var(--bg-tertiary)",
    text: "var(--text-muted)",
  },
  draft: {
    label: "Draft",
    bg: "var(--accent-yellow, #EAB308)",
    text: "#000",
  },
};

interface PolicyStatusBadgeProps {
  status: SLAPolicyStatus;
}

export function PolicyStatusBadge({ status }: PolicyStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  );
}
