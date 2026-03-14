"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface CSATScoreCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend: number;
  trendLabel?: string;
  isPositive?: boolean;
  accent?: string;
  onClick?: () => void;
}

export function CSATScoreCard({
  title,
  value,
  unit,
  trend,
  trendLabel = "vs previous period",
  isPositive = true,
  accent,
  onClick,
}: CSATScoreCardProps) {
  const trendUp = trend > 0;
  const trendGood = trendUp === isPositive;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border p-6 text-left transition-all hover:shadow-md"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-default)",
      }}
    >
      <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
        {title}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="text-3xl font-bold"
          style={{ color: accent ?? "var(--text-primary)" }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-lg" style={{ color: "var(--text-secondary)" }}>
            {unit}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div
          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: trendGood
              ? "rgba(52,211,153,0.1)"
              : "rgba(248,113,113,0.1)",
            color: trendGood ? "var(--accent-green)" : "var(--accent-red)",
          }}
        >
          {trendUp ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {Math.abs(trend)}%
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {trendLabel}
        </span>
      </div>
    </button>
  );
}
