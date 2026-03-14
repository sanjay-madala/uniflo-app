"use client";

import { Card, CardHeader, CardTitle, CardContent, DonutChart } from "@uniflo/ui";
import type { CAPAAnalytics } from "@uniflo/mock-data";

interface CAPASeverityBreakdownProps {
  data: CAPAAnalytics;
}

export function CAPASeverityBreakdown({ data }: CAPASeverityBreakdownProps) {
  const chartData = data.by_severity.map((s) => ({
    name: s.severity,
    value: s.count,
    color: s.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Severity Breakdown
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Open CAPAs by severity</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label={`Donut chart showing CAPAs by severity: ${chartData.map((d) => `${d.name}: ${d.value}`).join(", ")}`}>
          <DonutChart
            data={chartData}
            height={260}
            innerRadius={50}
            outerRadius={80}
            centerLabel={String(data.total_open)}
            showLegend
          />
        </div>
      </CardContent>
    </Card>
  );
}
