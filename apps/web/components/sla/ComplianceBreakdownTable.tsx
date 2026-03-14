"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  BarChart,
} from "@uniflo/ui";
import type { SLAComplianceByDimension } from "@uniflo/mock-data";

interface ComplianceBreakdownTableProps {
  data: SLAComplianceByDimension[];
  dimensionLabel: string;
}

function complianceColor(pct: number): string {
  if (pct > 90) return "var(--accent-green)";
  if (pct >= 70) return "var(--accent-yellow)";
  return "var(--accent-red)";
}

export function ComplianceBreakdownTable({
  data,
  dimensionLabel,
}: ComplianceBreakdownTableProps) {
  const chartData = data.map((d) => ({
    name: d.label,
    compliance: d.compliance_percent,
  }));

  return (
    <div className="space-y-4">
      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dimensionLabel}</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Met</TableHead>
            <TableHead className="text-right">Breached</TableHead>
            <TableHead className="text-right">Compliance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="text-sm font-medium text-[var(--text-primary)]">
                {row.label}
              </TableCell>
              <TableCell className="text-right text-sm text-[var(--text-secondary)]">
                {row.total}
              </TableCell>
              <TableCell className="text-right text-sm text-[var(--text-secondary)]">
                {row.met}
              </TableCell>
              <TableCell className="text-right text-sm">
                <span className={row.breached > 0 ? "text-[var(--accent-red)] font-medium" : "text-[var(--text-secondary)]"}>
                  {row.breached}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                <span style={{ color: complianceColor(row.compliance_percent) }}>
                  {row.compliance_percent.toFixed(1)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Bar chart */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
        <BarChart
          data={chartData}
          dataKey="compliance"
          xAxisKey="name"
          height={200}
          color="var(--accent-blue)"
          showLegend={false}
          showGrid
          showTooltip
        />
      </div>
    </div>
  );
}
