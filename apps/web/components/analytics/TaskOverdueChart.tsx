"use client";

import { Card, CardHeader, CardTitle, CardContent, BarChart } from "@uniflo/ui";
import type { TaskAnalytics } from "@uniflo/mock-data";

interface TaskOverdueChartProps {
  data: TaskAnalytics;
}

export function TaskOverdueChart({ data }: TaskOverdueChartProps) {
  const chartData = data.overdue_trend.map((d) => ({
    name: d.date,
    overdue: d.overdue,
    on_time: d.on_time,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Overdue vs On-Time
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Task timeliness per week</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Bar chart showing overdue versus on-time tasks per week">
          <BarChart data={chartData} dataKey="on_time" color="var(--accent-green)" height={260} showLegend={false} />
        </div>
      </CardContent>
    </Card>
  );
}
