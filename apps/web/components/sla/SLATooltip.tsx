"use client";

import type { SLAItemStatus } from "@uniflo/mock-data";
import { Check, X } from "lucide-react";

interface SLATooltipProps {
  itemStatus: SLAItemStatus;
}

const overallLabels: Record<string, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  breached: "Breached",
  paused: "Paused",
  met: "Met",
};

const overallColors: Record<string, string> = {
  on_track: "var(--accent-green)",
  at_risk: "var(--accent-yellow, #EAB308)",
  breached: "var(--accent-red)",
  paused: "var(--text-muted)",
  met: "var(--accent-green)",
};

function formatRemaining(ms: number): string {
  const absMs = Math.abs(ms);
  const hours = Math.floor(absMs / 3600000);
  const minutes = Math.floor((absMs % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function SLATooltip({ itemStatus }: SLATooltipProps) {
  return (
    <div
      className="rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3 shadow-lg"
      style={{ width: "280px" }}
    >
      <p className="text-xs font-medium text-[var(--text-primary)] mb-2">
        Policy: {itemStatus.policy_name}
      </p>
      <div className="border-t border-[var(--border-default)] my-2" />
      {itemStatus.targets.map((t, i) => (
        <div key={i} className="flex items-center justify-between py-1">
          <span className="text-xs text-[var(--text-secondary)]">{t.metric_label}</span>
          {t.status === "met" ? (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-green)]">
              <Check className="h-3 w-3" /> MET
            </span>
          ) : t.status === "breached" ? (
            <span className="inline-flex items-center gap-1 text-xs text-[var(--accent-red)]">
              <X className="h-3 w-3" /> BREACHED
            </span>
          ) : (
            <span
              className="text-xs font-medium"
              style={{
                color:
                  t.status === "at_risk"
                    ? "var(--accent-yellow, #EAB308)"
                    : "var(--text-secondary)",
              }}
            >
              {formatRemaining(t.remaining_ms)} remaining
            </span>
          )}
        </div>
      ))}
      <div className="border-t border-[var(--border-default)] my-2" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">Status</span>
        <span
          className="text-xs font-semibold"
          style={{ color: overallColors[itemStatus.overall_status] }}
        >
          {overallLabels[itemStatus.overall_status]}
        </span>
      </div>
    </div>
  );
}
