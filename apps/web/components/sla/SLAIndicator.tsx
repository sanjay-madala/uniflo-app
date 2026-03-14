"use client";

import type { SLAItemStatus } from "@uniflo/mock-data";

interface SLAIndicatorProps {
  itemStatus: SLAItemStatus | undefined;
}

const statusColors: Record<string, string> = {
  on_track: "var(--accent-green)",
  at_risk: "var(--accent-yellow, #EAB308)",
  breached: "var(--accent-red)",
  paused: "var(--text-muted)",
  met: "var(--accent-green)",
};

function formatRemaining(ms: number): string {
  if (ms < 0) return "BREACHED";
  const absMs = Math.abs(ms);
  const days = Math.floor(absMs / 86400000);
  const hours = Math.floor((absMs % 86400000) / 3600000);
  const minutes = Math.floor((absMs % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SLAIndicator({ itemStatus }: SLAIndicatorProps) {
  if (!itemStatus) {
    return <span className="text-xs text-[var(--text-muted)]">--</span>;
  }

  const color = statusColors[itemStatus.overall_status] ?? "var(--text-muted)";

  // Find the most urgent (worst) target
  const worstTarget = itemStatus.targets.reduce((worst, t) => {
    if (!worst) return t;
    if (t.status === "breached") return t;
    if (worst.status === "breached") return worst;
    if (t.remaining_ms < worst.remaining_ms) return t;
    return worst;
  }, itemStatus.targets[0]);

  if (!worstTarget) {
    return <span className="text-xs text-[var(--text-muted)]">--</span>;
  }

  // Compute a rough progress % based on the worst target
  const progressPercent =
    worstTarget.status === "met"
      ? 100
      : worstTarget.status === "breached"
        ? 100
        : Math.min(Math.max(100 - (worstTarget.remaining_ms / (worstTarget.remaining_ms + 3600000)) * 100, 5), 95);

  const text =
    worstTarget.status === "met"
      ? "Met"
      : formatRemaining(worstTarget.remaining_ms);

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-10 rounded-full bg-[var(--bg-tertiary)]">
        <div
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{ color }}
      >
        {text}
      </span>
    </div>
  );
}
