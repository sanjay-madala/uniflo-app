"use client";

interface CAPAKPIBarProps {
  total: number;
  open: number;
  overdue: number;
  closureRate: number;
}

export function CAPAKPIBar({ total, open, overdue, closureRate }: CAPAKPIBarProps) {
  const barColor = closureRate >= 80 ? "var(--accent-green)" : closureRate >= 50 ? "var(--accent-yellow)" : "var(--accent-red)";

  return (
    <div className="flex flex-wrap items-center gap-6 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Total</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Open</span>
        <span className="text-sm font-semibold text-[var(--accent-blue)]">{open}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Overdue</span>
        <span className={`text-sm font-semibold ${overdue > 0 ? "text-[var(--accent-red)]" : "text-[var(--text-primary)]"}`}>
          {overdue}
        </span>
      </div>
      <div className="flex flex-1 items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Closure Rate</span>
        <div className="flex flex-1 items-center gap-2">
          <div className="h-2 w-full max-w-[120px] rounded-full bg-[var(--bg-tertiary)]">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(closureRate, 100)}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{closureRate.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
