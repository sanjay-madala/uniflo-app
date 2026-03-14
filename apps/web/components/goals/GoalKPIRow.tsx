"use client";

import type { GoalDashboardKPIs } from "@uniflo/mock-data";
import { KPICard } from "@uniflo/ui";

interface GoalKPIRowProps {
  kpis: GoalDashboardKPIs;
  onFilterClick?: (filter: string) => void;
}

export function GoalKPIRow({ kpis, onFilterClick }: GoalKPIRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <button
        type="button"
        className="text-start"
        onClick={() => onFilterClick?.("all")}
      >
        <KPICard
          title="Active Goals"
          value={kpis.active_goals}
          trend={kpis.avg_progress}
          trendLabel="avg progress"
          color="#58A6FF"
        />
      </button>
      <button
        type="button"
        className="text-start"
        onClick={() => onFilterClick?.("on_track")}
      >
        <KPICard
          title="On Track"
          value={`${kpis.on_track_pct}%`}
          color="#3FB950"
        />
      </button>
      <button
        type="button"
        className="text-start"
        onClick={() => onFilterClick?.("achieved")}
      >
        <KPICard
          title="Achieved"
          value={kpis.achieved_goals}
          color="#58A6FF"
        />
      </button>
      <button
        type="button"
        className="text-start"
        onClick={() => onFilterClick?.("at_risk")}
      >
        <KPICard
          title="At Risk / Behind"
          value={`${kpis.at_risk_count} / ${kpis.behind_count}`}
          color="#F85149"
        />
      </button>
    </div>
  );
}
