"use client";

import type { CSATTrendPoint } from "@uniflo/mock-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface CSATTrendChartProps {
  data: CSATTrendPoint[];
  height?: number;
  showThreshold?: boolean;
  thresholdValue?: number;
}

export function CSATTrendChart({
  data,
  height = 300,
  showThreshold = false,
  thresholdValue = 3.0,
}: CSATTrendChartProps) {
  const chartData = data.map((d) => ({
    name: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: d.avg_score,
    responses: d.response_count,
    rate: d.response_rate,
  }));

  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-default)",
      }}
    >
      <h3
        className="mb-4 text-sm font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        CSAT Score Over Time
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
          <XAxis
            dataKey="name"
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            domain={[0, 5]}
            ticks={[1, 2, 3, 4, 5]}
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "0.5rem",
              color: "var(--text-primary)",
              fontSize: 12,
            }}
            formatter={(val: number, name: string) => {
              if (name === "score") return [val.toFixed(1), "Avg Score"];
              return [val, name];
            }}
          />
          {showThreshold && (
            <ReferenceLine
              y={thresholdValue}
              stroke="var(--accent-red)"
              strokeDasharray="4 4"
              label={{
                value: `Threshold (${thresholdValue})`,
                position: "insideTopRight",
                fill: "var(--accent-red)",
                fontSize: 11,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--accent-blue)"
            strokeWidth={2}
            dot={{ fill: "var(--accent-blue)", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
