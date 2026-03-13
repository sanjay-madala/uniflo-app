import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import clsx from "clsx";

export interface KPICardData {
  name: string;
  value: number;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  sparklineData?: KPICardData[];
  color?: string;
  className?: string;
  isPositive?: boolean;
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  trendLabel,
  sparklineData,
  color = "#58A6FF",
  className,
  isPositive = true,
}: KPICardProps) {
  const hasTrend = trend !== undefined && trend !== null;
  const trendDirection = trend && trend > 0 ? "up" : "down";
  const trendIsPositive = (trend && trend > 0) === isPositive;

  return (
    <div
      className={clsx(
        "rounded-lg border border-gray-700 bg-gray-900 p-6",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-100">{value}</span>
            {unit && <span className="text-lg text-gray-400">{unit}</span>}
          </div>

          {hasTrend && (
            <div className="mt-3 flex items-center gap-2">
              <div
                className={clsx(
                  "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
                  trendIsPositive
                    ? "bg-green-900/50 text-green-400"
                    : "bg-red-900/50 text-red-400"
                )}
              >
                {trendDirection === "up" ? (
                  <TrendingUpIcon size={14} />
                ) : (
                  <TrendingDownIcon size={14} />
                )}
                <span>{Math.abs(trend)}%</span>
              </div>
              {trendLabel && (
                <span className="text-xs text-gray-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
