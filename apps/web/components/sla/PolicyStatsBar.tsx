"use client";

import { KPICard } from "@uniflo/ui";

interface PolicyStatsBarProps {
  totalPolicies: number;
  activePolicies: number;
  breachesToday: number;
  compliancePercent: number;
}

export function PolicyStatsBar({
  totalPolicies,
  activePolicies,
  breachesToday,
  compliancePercent,
}: PolicyStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard
        title="Total Policies"
        value={totalPolicies}
        color="var(--accent-blue)"
      />
      <KPICard
        title="Active"
        value={activePolicies}
        color="var(--accent-green)"
      />
      <KPICard
        title="Breaches Today"
        value={breachesToday}
        color="var(--accent-red)"
      />
      <KPICard
        title="Compliance"
        value={`${compliancePercent.toFixed(1)}%`}
        color={compliancePercent > 90 ? "var(--accent-green)" : compliancePercent >= 70 ? "var(--accent-yellow)" : "var(--accent-red)"}
      />
    </div>
  );
}
