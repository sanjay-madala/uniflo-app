"use client";

import { Card, CardHeader, CardTitle, CardContent, BarChart } from "@uniflo/ui";
import type { TicketAnalytics } from "@uniflo/mock-data";

interface TicketSLAComplianceChartProps {
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

export function TicketSLAComplianceChart({ data }: TicketSLAComplianceChartProps) {
  const chartData = data.map((d) => ({
    name: MONTH_LABELS[d.period] ?? d.period,
    sla_met: d.sla_met,
    sla_breached: d.sla_breached,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          SLA Compliance
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Met vs breached per month</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Bar chart showing SLA met versus breached tickets per month">
          <BarChart data={chartData} dataKey="sla_met" color="#3FB950" height={260} showLegend={false} />
        </div>
      </CardContent>
    </Card>
  );
}
