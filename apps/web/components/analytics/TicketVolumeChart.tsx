"use client";

import { Card, CardHeader, CardTitle, CardContent, BarChart } from "@uniflo/ui";
import type { TicketAnalytics } from "@uniflo/mock-data";

interface TicketVolumeChartProps {
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

export function TicketVolumeChart({ data }: TicketVolumeChartProps) {
  const chartData = data.map((d) => ({
    name: MONTH_LABELS[d.period] ?? d.period,
    created: d.created,
    resolved: d.resolved,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Ticket Volume
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Created vs resolved per month</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Bar chart showing ticket volume by month for the last 6 months">
          <BarChart data={chartData} dataKey="created" color="var(--accent-blue)" height={260} showLegend={false} />
        </div>
      </CardContent>
    </Card>
  );
}
