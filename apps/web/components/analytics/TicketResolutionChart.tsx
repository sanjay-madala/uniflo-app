"use client";

import { Card, CardHeader, CardTitle, CardContent, LineChart } from "@uniflo/ui";
import type { TicketAnalytics } from "@uniflo/mock-data";

interface TicketResolutionChartProps {
  data: TicketAnalytics[];
}

const MONTH_LABELS: Record<string, string> = {
  "2025-10": "Oct",
  "2025-11": "Nov",
  "2025-12": "Dec",
  "2026-01": "Jan",
  "2026-02": "Feb",
  "2026-03": "Mar",
};

export function TicketResolutionChart({ data }: TicketResolutionChartProps) {
  const chartData = data.map((d) => ({
    name: MONTH_LABELS[d.period] ?? d.period,
    avg_resolution_hours: d.avg_resolution_hours,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Resolution Time Trend
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Average hours to resolve</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Area chart showing average ticket resolution hours over the last 6 months">
          <LineChart
            data={chartData}
            dataKey="avg_resolution_hours"
            color="var(--accent-yellow)"
            height={260}
            fill
            showLegend={false}
          />
        </div>
      </CardContent>
    </Card>
  );
}
