"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@uniflo/ui";
import type { TaskAnalytics } from "@uniflo/mock-data";

interface TaskWorkloadChartProps {
  data: TaskAnalytics;
}

export function TaskWorkloadChart({ data }: TaskWorkloadChartProps) {
  const chartData = data.by_assignee.map((a) => ({
    name: a.user_name.split(" ")[0],
    assigned: a.assigned,
    completed: a.completed,
    overdue: a.overdue,
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
          Team Workload
        </CardTitle>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Tasks per assignee</p>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label="Horizontal bar chart showing task workload per team member">
          <ResponsiveContainer width="100%" height={200}>
            <RechartsBarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
              <XAxis type="number" stroke="#888888" />
              <YAxis type="category" dataKey="name" stroke="#888888" width={80} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="assigned" fill="#58A6FF" name="Assigned" />
              <Bar dataKey="completed" fill="#3FB950" name="Completed" />
              <Bar dataKey="overdue" fill="#F85149" name="Overdue" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
