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
    backgroundColor: "#1a1a1a",
    border: "1px solid #333333",
    borderRadius: "0.5rem",
    color: "#ffffff",
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
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="date" stroke="#888888" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  stroke="#3FB950"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Compliance", angle: -90, position: "insideLeft", style: { fill: "#3FB950", fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#BC8CFF"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "CSAT", angle: 90, position: "insideRight", style: { fill: "#BC8CFF", fontSize: 11 } }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="compliance"
                  stroke="#3FB950"
                  fill="#3FB950"
                  fillOpacity={0.15}
                  name="Compliance Score"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="csat"
                  stroke="#BC8CFF"
                  fill="#BC8CFF"
                  fillOpacity={0.15}
                  name="CSAT Score"
                />
              </AreaChart>
            ) : (
              <RechartsLineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <XAxis dataKey="date" stroke="#888888" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  stroke="#3FB950"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "Compliance", angle: -90, position: "insideLeft", style: { fill: "#3FB950", fontSize: 11 } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#BC8CFF"
                  domain={[0, 100]}
                  tick={{ fontSize: 11 }}
                  label={{ value: "CSAT", angle: 90, position: "insideRight", style: { fill: "#BC8CFF", fontSize: 11 } }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="compliance"
                  stroke="#3FB950"
                  strokeWidth={2}
                  dot={false}
                  name="Compliance Score"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="csat"
                  stroke="#BC8CFF"
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
