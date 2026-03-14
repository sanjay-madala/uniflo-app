"use client";

import { useState } from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@uniflo/ui";
import type { TrendDataPoint } from "@uniflo/mock-data";

interface DashboardTrendChartProps {
  data: TrendDataPoint[];
}

export function DashboardTrendChart({ data }: DashboardTrendChartProps) {
  const [chartType, setChartType] = useState<"line" | "area">("line");

  const tooltipStyle = {
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: "0.5rem",
    color: "var(--text-primary)",
  };

  // Show every 5th label
  const displayData = data.map((point, i) => ({
    ...point,
    label: i % 5 === 0 ? point.date : "",
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
              Compliance & Satisfaction Trend
            </CardTitle>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">30-day correlation</p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-[var(--border-default)] p-0.5">
            <button
              onClick={() => setChartType("line")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                chartType === "line"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                chartType === "area"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Area
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label="Dual-line chart showing compliance score and CSAT score trends over the last 30 days"
        >
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "area" ? (
              <AreaChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  stroke="var(--accent-green)"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Compliance", angle: -90, position: "insideLeft", style: { fill: "var(--accent-green)", fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--accent-purple)"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "CSAT", angle: 90, position: "insideRight", style: { fill: "var(--accent-purple)", fontSize: 11 } }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="compliance"
                  stroke="var(--accent-green)"
                  fill="var(--accent-green)"
                  fillOpacity={0.15}
                  name="Compliance Score"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="csat"
                  stroke="var(--accent-purple)"
                  fill="var(--accent-purple)"
                  fillOpacity={0.15}
                  name="CSAT Score"
                />
              </AreaChart>
            ) : (
              <RechartsLineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  stroke="var(--accent-green)"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Compliance", angle: -90, position: "insideLeft", style: { fill: "var(--accent-green)", fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--accent-purple)"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "CSAT", angle: 90, position: "insideRight", style: { fill: "var(--accent-purple)", fontSize: 11 } }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="compliance"
                  stroke="var(--accent-green)"
                  strokeWidth={2}
                  dot={false}
                  name="Compliance Score"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="csat"
                  stroke="var(--accent-purple)"
                  strokeWidth={2}
                  dot={false}
                  name="CSAT Score"
                />
              </RechartsLineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
