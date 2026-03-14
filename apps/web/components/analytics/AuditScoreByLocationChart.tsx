"use client";

import { Card, CardHeader, CardTitle, CardContent, BarChart } from "@uniflo/ui";
import type { AuditAnalytics } from "@uniflo/mock-data";

interface AuditScoreByLocationChartProps {
  data: AuditAnalytics;
}

export function AuditScoreByLocationChart({ data }: AuditScoreByLocationChartProps) {
  const chartData = data.by_location.map((loc) => ({
    name: loc.location_name,
    avg_score: loc.avg_score,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Scores by Location
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Average audit score per location</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Bar chart showing average audit scores by location">
          <BarChart data={chartData} dataKey="avg_score" color="var(--accent-green)" height={260} showLegend={false} />
        </div>
      </CardContent>
    </Card>
  );
}
