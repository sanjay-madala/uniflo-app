"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@uniflo/ui";
import type { CrossModuleSummary } from "@uniflo/mock-data";

interface DashboardSLASummaryProps {
  summary: CrossModuleSummary;
}

export function DashboardSLASummary({ summary }: DashboardSLASummaryProps) {
  const pct = summary.sla.overall_compliance_pct;
  const breaches = summary.sla.breaches_this_period;
  const avgBreach = summary.sla.avg_time_to_breach_hours;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          SLA Compliance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--text-secondary)]">SLA Compliance</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 90 ? "var(--accent-green)" : pct >= 75 ? "var(--accent-yellow)" : "var(--accent-red)",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-[var(--border-default)] p-3">
            <p className="text-xs text-[var(--text-muted)]">Breaches</p>
            <p className="text-lg font-bold text-[var(--accent-red)]">{breaches}</p>
            <p className="text-xs text-[var(--text-muted)]">this period</p>
          </div>
          <div className="rounded-md border border-[var(--border-default)] p-3">
            <p className="text-xs text-[var(--text-muted)]">Avg to Breach</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">{avgBreach < 1 ? `${Math.round(avgBreach * 60)}m` : `${avgBreach}h`}</p>
            <p className="text-xs text-[var(--text-muted)]">response time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
