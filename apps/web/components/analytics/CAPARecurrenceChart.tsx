"use client";

import { Card, CardHeader, CardTitle, CardContent, BarChart } from "@uniflo/ui";
import type { CAPAAnalytics } from "@uniflo/mock-data";

interface CAPARecurrenceChartProps {
  data: CAPAAnalytics;
}

export function CAPARecurrenceChart({ data }: CAPARecurrenceChartProps) {
  const chartData = data.by_source.map((s) => ({
    name: s.source,
    count: s.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Source Breakdown
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">CAPAs by source</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Bar chart showing CAPA source breakdown">
          <BarChart data={chartData} dataKey="count" color="var(--accent-yellow)" height={260} showLegend={false} />
        </div>
      </CardContent>
    </Card>
  );
}
