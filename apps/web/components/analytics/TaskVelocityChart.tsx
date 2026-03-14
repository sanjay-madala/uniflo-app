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
    backgroundColor: "var(--bg-elevated)",
    border: "1px solid var(--border-default)",
    borderRadius: "0.5rem",
    color: "var(--text-primary)",
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
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="var(--accent-blue)" strokeWidth={2} dot={{ fill: "var(--accent-blue)" }} name="Created" />
              <Line type="monotone" dataKey="completed" stroke="var(--accent-green)" strokeWidth={2} dot={{ fill: "var(--accent-green)" }} name="Completed" />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
