"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

interface SLABarProps {
  totalTickets: number;
  breachedCount: number;
  compliancePercent?: number;
  showCounts?: boolean;
  policyId?: string;
  policyName?: string;
  onViewAlerts?: () => void;
}

export function SLABar({
  totalTickets,
  breachedCount,
  compliancePercent,
  showCounts = true,
  policyId,
  policyName,
  onViewAlerts,
}: SLABarProps) {
  const { locale } = useParams<{ locale: string }>();
  const percent = compliancePercent ?? (totalTickets > 0 ? ((totalTickets - breachedCount) / totalTickets) * 100 : 100);
  const barColor = percent > 90 ? "var(--accent-green)" : percent >= 70 ? "var(--accent-yellow)" : "var(--accent-red)";

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
          {policyId && policyName && (
            <>
              {" — "}
              <Link
                href={`/${locale}/sla/${policyId}/`}
                className="text-[var(--accent-blue)] hover:underline"
              >
                {policyName}
              </Link>
            </>
          )}
          {breachedCount > 0 && (
            <span className="text-[var(--accent-red)]"> · {breachedCount} breach{breachedCount !== 1 ? "es" : ""}</span>
          )}
          {onViewAlerts && breachedCount > 0 && (
            <>
              {" "}
              <Link
                href={`/${locale}/sla/alerts/?module=tickets`}
                className="text-xs text-[var(--accent-blue)] hover:underline"
              >
                View Alerts
              </Link>
            </>
          )}
        </span>
      )}
    </div>
  );
}
