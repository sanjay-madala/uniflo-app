"use client";

import { LineChart } from "@uniflo/ui";
import type { AuditTrendPoint } from "@uniflo/mock-data";

interface AuditTrendChartProps {
  data: AuditTrendPoint[];
  height?: number;
  className?: string;
}

export function AuditTrendChart({ data, height = 300, className }: AuditTrendChartProps) {
  const chartData = data.map((d) => ({
    name: d.month,
    score: d.score,
    pass_rate: d.pass_rate,
    audit_count: d.audit_count,
  }));

  return (
    <div className={className}>
      <LineChart
        data={chartData}
        dataKey="score"
        xAxisKey="name"
        height={height}
        color="#58A6FF"
        fill
        showLegend={false}
        showGrid
        showTooltip
      />
    </div>
  );
}
