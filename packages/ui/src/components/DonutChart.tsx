import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import clsx from "clsx";

export interface DonutChartData {
  name: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  data: DonutChartData[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  centerLabel?: string;
}

const DEFAULT_COLORS = [
  "#58A6FF",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function DonutChart({
  data,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  responsive = true,
  innerRadius = 60,
  outerRadius = 100,
  centerLabel,
}: DonutChartProps) {
  const ChartComponent = (
    <PieChart height={height}>
      {showTooltip && (
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #333333",
            borderRadius: "0.5rem",
            color: "#ffffff",
          }}
        />
      )}
      {showLegend && <Legend />}
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        paddingAngle={5}
        dataKey="value"
        label={centerLabel ? { position: "center" as const } : false}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
          />
        ))}
      </Pie>
      {centerLabel && (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
          <tspan
            className="fill-gray-100 font-semibold text-lg"
            x="50%"
            dy="0"
          >
            {centerLabel}
          </tspan>
        </text>
      )}
    </PieChart>
  );

  return (
    <div className={clsx("w-full flex justify-center", className)}>
      {responsive ? (
        <ResponsiveContainer width="100%" height={height}>
          {ChartComponent}
        </ResponsiveContainer>
      ) : (
        ChartComponent
      )}
    </div>
  );
}
