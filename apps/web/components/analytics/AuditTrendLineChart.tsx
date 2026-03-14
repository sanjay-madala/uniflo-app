"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@uniflo/ui";
import type { AuditAnalytics } from "@uniflo/mock-data";

interface AuditTrendLineChartProps {
  data: AuditAnalytics[];
  passThreshold?: number;
}

const MONTH_LABELS: Record<string, string> = {
  "2025-10": "Oct",
  "2025-11": "Nov",
  "2025-12": "Dec",
  "2026-01": "Jan",
  "2026-02": "Feb",
  "2026-03": "Mar",
};

export function AuditTrendLineChart({ data, passThreshold = 80 }: AuditTrendLineChartProps) {
  const chartData = data.map((d) => ({
    name: MONTH_LABELS[d.period] ?? d.period,
    avg_score: d.avg_score,
    pass_rate: d.pass_rate,
  }));

  const tooltipStyle = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: "0.5rem",
    color: "var(--text-primary)",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Audit Score Trend
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">6-month score trend with pass threshold</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Line chart showing audit score trend over 6 months with pass threshold at 80%">
          <ResponsiveContainer width="100%" height={260}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <ReferenceLine
                y={passThreshold}
                stroke="var(--accent-yellow)"
                strokeDasharray="5 5"
                label={{ value: "Pass threshold", position: "right", fill: "var(--accent-yellow)", fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="avg_score"
                stroke="var(--accent-green)"
                strokeWidth={2}
                dot={{ fill: "var(--accent-green)" }}
                name="Avg Score"
              />
              <Line
                type="monotone"
                dataKey="pass_rate"
                stroke="var(--accent-blue)"
                strokeWidth={2}
                dot={{ fill: "var(--accent-blue)" }}
                name="Pass Rate"
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
