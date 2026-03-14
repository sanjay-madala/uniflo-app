"use client";

import { LineChart } from "@uniflo/ui";
import type { SLAComplianceTrendPoint } from "@uniflo/mock-data";

interface ComplianceChartProps {
  data: SLAComplianceTrendPoint[];
  moduleFilter: string;
  height?: number;
}

export function ComplianceChart({
  data,
  moduleFilter,
  height = 320,
}: ComplianceChartProps) {
  // Build chart data based on filter
  const chartData = (() => {
    if (moduleFilter !== "all") {
      return data
        .filter((d) => d.module === moduleFilter)
        .map((d) => ({
          name: new Date(d.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          compliance: d.compliance_percent,
        }));
    }

    // For "all" modules, aggregate by date (average across modules)
    const grouped = new Map<string, { total: number; count: number; label: string }>();
    for (const d of data) {
      const dateLabel = new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const existing = grouped.get(d.date) ?? { total: 0, count: 0, label: dateLabel };
      existing.total += d.compliance_percent;
      existing.count += 1;
      grouped.set(d.date, existing);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        name: v.label,
        compliance: Number((v.total / v.count).toFixed(1)),
      }));
  })();

  const moduleColors: Record<string, string> = {
    tickets: "#58A6FF",
    audits: "#BC8CFF",
    capa: "#D29922",
    all: "#58A6FF",
  };

  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Compliance Trend
        </h3>
        <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#58A6FF" }} /> Tickets
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#BC8CFF" }} /> Audits
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#D29922" }} /> CAPA
          </span>
          <span className="text-[var(--text-muted)]">
            Target: 90%
          </span>
        </div>
      </div>
      <LineChart
        data={chartData}
        dataKey="compliance"
        xAxisKey="name"
        height={height}
        color={moduleColors[moduleFilter] ?? "#58A6FF"}
        showLegend={false}
        showGrid
        showTooltip
        fill
      />
    </div>
  );
}
