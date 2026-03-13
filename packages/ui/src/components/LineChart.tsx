import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import clsx from "clsx";

export interface LineChartData {
  name: string;
  [key: string]: string | number;
}

export interface LineChartProps {
  data: LineChartData[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  responsive?: boolean;
  fill?: boolean;
}

export function LineChart({
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
  fill = false,
}: LineChartProps) {
  const ChartComponent = fill ? (
    <AreaChart data={data} height={height}>
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
      <Area
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        fill={color}
        fillOpacity={0.3}
      />
    </AreaChart>
  ) : (
    <RechartsLineChart data={data} height={height}>
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
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={color}
        dot={{ fill: color }}
        strokeWidth={2}
      />
    </RechartsLineChart>
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
