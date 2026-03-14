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
import type { TaskAnalytics } from "@uniflo/mock-data";

interface TaskVelocityChartProps {
  data: TaskAnalytics;
}

export function TaskVelocityChart({ data }: TaskVelocityChartProps) {
  const chartData = data.completion_trend;

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
          Completion Trend
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Created vs completed per week</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Line chart showing task completion trend by week">
          <ResponsiveContainer width="100%" height={260}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis dataKey="date" stroke="#888888" />
              <YAxis stroke="#888888" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#58A6FF" strokeWidth={2} dot={{ fill: "#58A6FF" }} name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#3FB950" strokeWidth={2} dot={{ fill: "#3FB950" }} name="Completed" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
