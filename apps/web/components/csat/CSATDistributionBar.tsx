"use client";

import type { CSATDistribution } from "@uniflo/mock-data";

type StarKey = "star_1" | "star_2" | "star_3" | "star_4" | "star_5";

const segmentConfig: { key: StarKey; label: string; color: string; starNum: number }[] = [
  { key: "star_5", label: "5 stars", color: "var(--accent-green)", starNum: 5 },
  { key: "star_4", label: "4 stars", color: "var(--accent-green)", starNum: 4 },
  { key: "star_3", label: "3 stars", color: "var(--accent-yellow)", starNum: 3 },
  { key: "star_2", label: "2 stars", color: "var(--accent-orange)", starNum: 2 },
  { key: "star_1", label: "1 star", color: "var(--accent-red)", starNum: 1 },
];

interface CSATDistributionBarProps {
  distribution: CSATDistribution;
  onSegmentClick?: (stars: number) => void;
  activeFilter?: number | null;
}

export function CSATDistributionBar({
  distribution,
  onSegmentClick,
  activeFilter,
}: CSATDistributionBarProps) {
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
        Score Distribution
      </h3>
      <div className="space-y-3">
        {segmentConfig.map((seg) => {
          const count = distribution[seg.key];
          const pct = distribution.total > 0
            ? Math.round((count / distribution.total) * 100)
            : 0;
          const isActive = activeFilter === seg.starNum;

          return (
            <button
              key={seg.key}
              onClick={() => onSegmentClick?.(seg.starNum)}
              className="flex w-full items-center gap-3 rounded-md px-2 py-1 text-left transition-colors hover:opacity-90"
              style={{
                backgroundColor: isActive ? "rgba(88,166,255,0.08)" : "transparent",
                borderWidth: isActive ? 1 : 0,
                borderStyle: "solid",
                borderColor: isActive ? "var(--accent-blue)" : "transparent",
              }}
            >
              <span
                className="w-14 shrink-0 text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {seg.label}
              </span>
              <div className="flex-1">
                <div
                  className="h-5 overflow-hidden rounded"
                  style={{ backgroundColor: "var(--bg-tertiary, rgba(0,0,0,0.1))" }}
                >
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: seg.color,
                      minWidth: pct > 0 ? "2px" : "0",
                    }}
                  />
                </div>
              </div>
              <span
                className="w-12 shrink-0 text-right text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {pct}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
