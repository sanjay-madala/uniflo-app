"use client";

import { Card, CardHeader, CardTitle, CardContent, DonutChart } from "@uniflo/ui";
import type { CrossModuleSummary } from "@uniflo/mock-data";

interface DashboardModuleBreakdownProps {
  summary: CrossModuleSummary;
}

export function DashboardModuleBreakdown({ summary }: DashboardModuleBreakdownProps) {
  const data = [
    { name: "Open Tickets", value: summary.tickets.open, color: "#58A6FF" },
    { name: "Audits Completed", value: summary.audits.completed_this_period, color: "#3FB950" },
    { name: "CAPAs Open", value: summary.capa.open, color: "#D29922" },
    { name: "Tasks Open", value: summary.tasks.open, color: "#BC8CFF" },
    { name: "SLA Breaches", value: summary.sla.breaches_this_period, color: "#F85149" },
  ];

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Module Breakdown
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          Distribution across modules
        </p>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label={`Donut chart showing module breakdown: ${data.map((d) => `${d.name}: ${d.value}`).join(", ")}`}
        >
          <DonutChart
            data={data}
            height={220}
            innerRadius={50}
            outerRadius={80}
            centerLabel={String(total)}
            showLegend
          />
        </div>
      </CardContent>
    </Card>
  );
}
