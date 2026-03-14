"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@uniflo/ui";
import type { CAPAAnalytics } from "@uniflo/mock-data";

interface CAPAClosureRateChartProps {
  data: CAPAAnalytics[];
}

const MONTH_LABELS: Record<string, string> = {
  "2025-10": "Oct",
  "2025-11": "Nov",
  "2025-12": "Dec",
  "2026-01": "Jan",
  "2026-02": "Feb",
  "2026-03": "Mar",
};

export function CAPAClosureRateChart({ data }: CAPAClosureRateChartProps) {
  const chartData = data.map((d) => ({
    name: MONTH_LABELS[d.period] ?? d.period,
    opened: d.closure_trend[0]?.opened ?? 0,
    closed: d.closure_trend[0]?.closed ?? 0,
  }));

  const tooltipStyle = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #333333",
    borderRadius: "0.5rem",
    color: "#ffffff",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Closure Trend
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Opened vs closed per month</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Line chart showing CAPA opened versus closed per month">
          <ResponsiveContainer width="100%" height={260}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="name" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="opened" stroke="#F85149" strokeWidth={2} dot={{ fill: "#F85149" }} name="Opened" />
              <Line type="monotone" dataKey="closed" stroke="#3FB950" strokeWidth={2} dot={{ fill: "#3FB950" }} name="Closed" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
