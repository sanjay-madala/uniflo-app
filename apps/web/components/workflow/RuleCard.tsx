"use client";

import Link from "next/link";
import { Badge } from "@uniflo/ui";
import type { AutomationRule } from "@uniflo/mock-data";
import { RuleStatusBadge } from "./RuleStatusBadge";
import { RuleTriggerChip } from "./RuleTriggerChip";
import { EnableToggle } from "./EnableToggle";

const NOW = new Date("2026-03-13T12:00:00Z");

const moduleLabels: Record<string, string> = {
  tickets: "Tickets",
  audits: "Audits",
  capa: "CAPA",
  tasks: "Tasks",
  sops: "SOPs",
  sla: "SLA",
};

const moduleBadgeColors: Record<string, string> = {
  tickets: "text-[#58A6FF] border-[#58A6FF]/30 bg-[#58A6FF]/10",
  audits: "text-[#3FB950] border-[#3FB950]/30 bg-[#3FB950]/10",
  capa: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10",
  tasks: "text-[#BC8CFF] border-[#BC8CFF]/30 bg-[#BC8CFF]/10",
  sops: "text-[var(--text-secondary)] border-[var(--text-secondary)]/30 bg-[var(--text-secondary)]/10",
  sla: "text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10",
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const date = new Date(dateStr);
  const diffMs = NOW.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface RuleCardProps {
  rule: AutomationRule;
  locale: string;
  onToggle: (ruleId: string, enabled: boolean) => void;
}

export function RuleCard({ rule, locale, onToggle }: RuleCardProps) {
  return (
    <div className="group rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 hover:border-[#3D444D] hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        {/* Toggle */}
        <div className="pt-0.5" onClick={e => e.stopPropagation()}>
          <EnableToggle
            ruleId={rule.id}
            ruleName={rule.name}
            status={rule.status}
            onToggle={onToggle}
          />
        </div>

        {/* Content */}
        <Link
          href={`/${locale}/workflow/${rule.id}/`}
          className="flex-1 min-w-0"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {rule.name}
                </h3>
                <RuleStatusBadge status={rule.status} />
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)] line-clamp-1">
                {rule.description}
              </p>
            </div>
            <Badge variant="default" className={moduleBadgeColors[rule.trigger.module]}>
              {moduleLabels[rule.trigger.module]}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
            <RuleTriggerChip trigger={rule.trigger} />
            <span className="text-[var(--text-muted)]">|</span>
            <span>Last run: {timeAgo(rule.last_triggered_at)}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>
              Executions: <span className="text-[var(--text-secondary)]">{rule.execution_count}</span>
            </span>
            <span>
              Success: <span className="text-[var(--accent-green)]">{rule.success_count}</span>
            </span>
            {rule.failure_count > 0 && (
              <span>
                Failures: <span className="text-[var(--accent-red)]">{rule.failure_count}</span>
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
