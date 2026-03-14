"use client";

interface AuditComplianceBarProps {
  avgScore: number;
  totalAudits: number;
  failedCount: number;
}

export function AuditComplianceBar({ avgScore, totalAudits, failedCount }: AuditComplianceBarProps) {
  const barColor = avgScore > 90 ? "var(--accent-green)" : avgScore >= 70 ? "var(--accent-yellow, #EAB308)" : "var(--accent-red)";

  return (
    <div className="flex items-center gap-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex-1">
        <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(avgScore, 100)}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      <span className="shrink-0 text-sm text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">{avgScore.toFixed(1)}%</span>
        {" Average Compliance"}
        {failedCount > 0 && (
          <span className="text-[var(--accent-red)]"> · {failedCount} failed audit{failedCount !== 1 ? "s" : ""}</span>
        )}
      </span>
    </div>
  );
}
