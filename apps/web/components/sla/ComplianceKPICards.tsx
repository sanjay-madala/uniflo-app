"use client";

import { KPICard } from "@uniflo/ui";

interface ComplianceKPICardsProps {
  compliancePercent: number;
  totalItems: number;
  breachCount: number;
  avgResolutionMinutes: number;
  prevCompliancePercent?: number;
  prevTotalItems?: number;
  prevBreachCount?: number;
  prevAvgResolutionMinutes?: number;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ComplianceKPICards({
  compliancePercent,
  totalItems,
  breachCount,
  avgResolutionMinutes,
  prevCompliancePercent,
  prevTotalItems,
  prevBreachCount,
  prevAvgResolutionMinutes,
}: ComplianceKPICardsProps) {
  const complianceTrend = prevCompliancePercent
    ? Number((compliancePercent - prevCompliancePercent).toFixed(1))
    : undefined;
  const itemsTrend = prevTotalItems
    ? Number((((totalItems - prevTotalItems) / prevTotalItems) * 100).toFixed(1))
    : undefined;
  const breachTrend = prevBreachCount !== undefined
    ? Number(((breachCount - prevBreachCount)).toFixed(0))
    : undefined;
  const resTrend = prevAvgResolutionMinutes
    ? Number((((avgResolutionMinutes - prevAvgResolutionMinutes) / prevAvgResolutionMinutes) * 100).toFixed(1))
    : undefined;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Compliance Rate"
        value={`${compliancePercent.toFixed(1)}%`}
        trend={complianceTrend}
        trendLabel="vs prior period"
        color={
          compliancePercent > 90
            ? "var(--accent-green)"
            : compliancePercent >= 70
              ? "var(--accent-yellow)"
              : "var(--accent-red)"
        }
        isPositive={true}
      />
      <KPICard
        title="Items Tracked"
        value={totalItems}
        trend={itemsTrend}
        trendLabel="vs prior period"
        color="var(--accent-blue)"
        isPositive={true}
      />
      <KPICard
        title="Breaches"
        value={breachCount}
        trend={breachTrend}
        trendLabel="vs prior period"
        color="var(--accent-red)"
        isPositive={false}
      />
      <KPICard
        title="Avg Resolution Time"
        value={formatDuration(avgResolutionMinutes)}
        trend={resTrend}
        trendLabel="vs prior period"
        color="var(--accent-blue)"
        isPositive={false}
      />
    </div>
  );
}
