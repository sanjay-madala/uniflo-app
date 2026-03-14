"use client";

import { AlertTriangle, X } from "lucide-react";
import type { CSATAlert } from "@uniflo/mock-data";

interface CSATAlertBannerProps {
  alert: CSATAlert;
  onViewDetails?: () => void;
  onDismiss?: () => void;
}

export function CSATAlertBanner({
  alert,
  onViewDetails,
  onDismiss,
}: CSATAlertBannerProps) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border-l-4 px-4 py-3"
      style={{
        backgroundColor: "rgba(217,119,6,0.08)",
        borderLeftColor: "var(--accent-yellow)",
        borderTop: "1px solid rgba(217,119,6,0.2)",
        borderRight: "1px solid rgba(217,119,6,0.2)",
        borderBottom: "1px solid rgba(217,119,6,0.2)",
        borderTopRightRadius: "0.5rem",
        borderBottomRightRadius: "0.5rem",
      }}
    >
      <AlertTriangle
        className="h-5 w-5 shrink-0"
        style={{ color: "var(--accent-yellow)" }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
          <strong>CSAT Alert:</strong> {alert.location_name} avg dropped to{" "}
          <strong>{alert.current_avg_score.toFixed(1)}</strong> (threshold{" "}
          {alert.threshold.toFixed(1)}). An audit is recommended.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              color: "var(--accent-blue)",
              backgroundColor: "rgba(88,166,255,0.1)",
            }}
          >
            View Details
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-md p-1.5 transition-colors hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
