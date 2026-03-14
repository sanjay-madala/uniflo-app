"use client";

import type { ExecutionStatus } from "@uniflo/mock-data";

const dotColors: Record<ExecutionStatus, string> = {
  success: "bg-[var(--accent-green)]",
  partial: "bg-yellow-500",
  failed: "bg-[var(--accent-red)]",
  skipped: "bg-[var(--text-muted)]",
};

export function ExecutionStatusDot({ status }: { status: ExecutionStatus }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${dotColors[status]}`}
      aria-label={status}
    />
  );
}
