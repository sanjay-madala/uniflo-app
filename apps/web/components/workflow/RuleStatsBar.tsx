"use client";

import type { AutomationRule, RuleExecution } from "@uniflo/mock-data";

interface RuleStatsBarProps {
  rules: AutomationRule[];
  executions: RuleExecution[];
}

export function RuleStatsBar({ rules, executions }: RuleStatsBarProps) {
  const totalRules = rules.length;
  const activeRules = rules.filter(r => r.status === "active").length;

  const now = new Date("2026-03-13T12:00:00Z");
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const firedToday = executions.filter(
    e => new Date(e.triggered_at) >= twentyFourHoursAgo,
  ).length;

  const failures = executions.filter(
    e => e.status === "failed" || e.status === "partial",
  ).length;

  const stats = [
    { label: "Total Rules", value: totalRules, color: "var(--text-primary)" },
    { label: "Active", value: activeRules, color: "var(--accent-green)" },
    { label: "Fired Today", value: firedToday, color: "var(--accent-blue)" },
    { label: "Failures", value: failures, color: failures > 0 ? "var(--accent-red)" : "var(--text-primary)" },
  ];

  return (
    <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="flex min-w-[140px] flex-1 flex-col rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3"
        >
          <span className="text-xs text-[var(--text-secondary)]">{stat.label}</span>
          <span
            className="mt-1 text-2xl font-bold"
            style={{ color: stat.color }}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
