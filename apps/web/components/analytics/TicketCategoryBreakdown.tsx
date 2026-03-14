"use client";

import { Card, CardHeader, CardTitle, CardContent, DonutChart } from "@uniflo/ui";
import type { TicketAnalytics } from "@uniflo/mock-data";

interface TicketCategoryBreakdownProps {
  data: TicketAnalytics;
}

export function TicketCategoryBreakdown({ data }: TicketCategoryBreakdownProps) {
  const chartData = data.by_category.map((c) => ({
    name: c.category,
    value: c.count,
    color: c.color,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          By Category
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Ticket distribution by category</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label={`Donut chart showing tickets by category: ${chartData.map((d) => `${d.name}: ${d.value}`).join(", ")}`}>
          <DonutChart
            data={chartData}
            height={260}
            innerRadius={50}
            outerRadius={80}
            centerLabel={String(data.created)}
            showLegend
          />
        </div>
      </CardContent>
    </Card>
  );
}
