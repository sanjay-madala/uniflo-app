"use client";

import type { LocationTrainingStats } from "@uniflo/mock-data";

interface LocationHeatmapGridProps {
  stats: LocationTrainingStats[];
}

function getCellColor(rate: number): { bg: string; text: string } {
  if (rate >= 90) return { bg: "rgba(16, 185, 129, 0.15)", text: "var(--accent-green)" };
  if (rate >= 70) return { bg: "rgba(88, 166, 255, 0.15)", text: "var(--accent-blue)" };
  if (rate >= 50) return { bg: "rgba(234, 179, 8, 0.15)", text: "var(--accent-yellow, #EAB308)" };
  return { bg: "rgba(239, 68, 68, 0.15)", text: "var(--accent-red)" };
}

export function LocationHeatmapGrid({ stats }: LocationHeatmapGridProps) {
  // Collect all unique module IDs across all locations
  const moduleColumns = new Map<string, string>();
  for (const loc of stats) {
    for (const mod of loc.modules) {
      if (!moduleColumns.has(mod.module_id)) {
        moduleColumns.set(mod.module_id, mod.module_title);
      }
    }
  }
  const columns = Array.from(moduleColumns.entries());

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-medium text-[var(--text-secondary)] p-3 border-b border-[var(--border-default)] sticky left-0 bg-[var(--bg-primary)] min-w-[140px]">
              Location
            </th>
            {columns.map(([id, title]) => (
              <th
                key={id}
                className="text-center text-xs font-medium text-[var(--text-secondary)] p-3 border-b border-[var(--border-default)] min-w-[120px]"
              >
                <span className="truncate block max-w-[120px]" title={title}>
                  {title.length > 16 ? `${title.slice(0, 14)}...` : title}
                </span>
              </th>
            ))}
            <th className="text-center text-xs font-medium text-[var(--text-secondary)] p-3 border-b border-[var(--border-default)] min-w-[100px]">
              Overall
            </th>
          </tr>
        </thead>
        <tbody>
          {stats.map((loc) => (
            <tr key={loc.location_id} className="hover:bg-[var(--bg-tertiary)]">
              <td className="text-sm font-medium text-[var(--text-primary)] p-3 border-b border-[var(--border-default)] sticky left-0 bg-[var(--bg-primary)]">
                {loc.location_name}
              </td>
              {columns.map(([moduleId]) => {
                const mod = loc.modules.find((m) => m.module_id === moduleId);
                if (!mod) {
                  return (
                    <td key={moduleId} className="text-center p-3 border-b border-[var(--border-default)]">
                      <span className="text-xs text-[var(--text-muted)]">--</span>
                    </td>
                  );
                }
                const colors = getCellColor(mod.completion_rate);
                return (
                  <td
                    key={moduleId}
                    className="text-center p-3 border-b border-[var(--border-default)]"
                    title={`${loc.location_name} / ${mod.module_title}: ${mod.completed}/${mod.assigned} completed (${mod.completion_rate}%), Avg score: ${mod.avg_score}%`}
                  >
                    <div
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-sm text-xs font-semibold cursor-default"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {mod.completion_rate}%
                    </div>
                  </td>
                );
              })}
              <td className="text-center p-3 border-b border-[var(--border-default)]">
                {(() => {
                  const colors = getCellColor(loc.completion_rate);
                  return (
                    <div
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-sm text-xs font-bold"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {loc.completion_rate}%
                    </div>
                  );
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-[var(--text-secondary)]">
        <span className="font-medium">Legend:</span>
        {[
          { label: "90-100%", color: "rgba(16, 185, 129, 0.15)", text: "var(--accent-green)" },
          { label: "70-89%", color: "rgba(88, 166, 255, 0.15)", text: "var(--accent-blue)" },
          { label: "50-69%", color: "rgba(234, 179, 8, 0.15)", text: "var(--accent-yellow, #EAB308)" },
          { label: "0-49%", color: "rgba(239, 68, 68, 0.15)", text: "var(--accent-red)" },
        ].map(({ label, color, text }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <span
              className="w-4 h-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span style={{ color: text }}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
