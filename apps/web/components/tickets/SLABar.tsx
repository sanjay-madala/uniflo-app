"use client";

interface SLABarProps {
  totalTickets: number;
  breachedCount: number;
  compliancePercent?: number;
  showCounts?: boolean;
}

export function SLABar({ totalTickets, breachedCount, compliancePercent, showCounts = true }: SLABarProps) {
  const percent = compliancePercent ?? (totalTickets > 0 ? ((totalTickets - breachedCount) / totalTickets) * 100 : 100);
  const barColor = percent > 90 ? "var(--accent-green)" : percent >= 70 ? "var(--accent-yellow, #EAB308)" : "var(--accent-red)";

  return (
    <div className="flex items-center gap-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex-1">
        <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      {showCounts && (
        <span className="shrink-0 text-sm text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{percent.toFixed(1)}%</span>
          {" SLA Compliance"}
          {breachedCount > 0 && (
            <span className="text-[var(--accent-red)]"> · {breachedCount} breach{breachedCount !== 1 ? "es" : ""}</span>
          )}
        </span>
      )}
    </div>
  );
}
