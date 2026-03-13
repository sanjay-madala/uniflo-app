import React from "react";
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
import clsx from "clsx";

export interface BarChartData {
  name: string;
  [key: string]: string | number;
}

export interface BarChartProps {
  data: BarChartData[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
}

export function BarChart({
  data,
  dataKey,
  xAxisKey = "name",
  color = "#58A6FF",
  height = 300,
  className,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  responsive = true,
}: BarChartProps) {
  const ChartComponent = (
    <RechartsBarChart data={data} height={height}>
      {showGrid && (
        <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
      )}
      <XAxis dataKey={xAxisKey} stroke="#888888" />
      <YAxis stroke="#888888" />
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
      <Bar dataKey={dataKey} fill={color} />
    </RechartsBarChart>
  );

  return (
    <div className={clsx("w-full", className)}>
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
