"use client";

import Link from "next/link";
import { Badge, Button } from "@uniflo/ui";
import type { AutomationRule } from "@uniflo/mock-data";
import { Edit } from "lucide-react";
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
  tickets: "text-[var(--accent-blue)] border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/10",
  audits: "text-[var(--accent-green)] border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10",
  capa: "text-[var(--accent-amber)] border-[var(--accent-amber)]/30 bg-[var(--accent-amber)]/10",
  tasks: "text-[var(--accent-purple)] border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/10",
  sops: "text-[var(--text-secondary)] border-[var(--text-secondary)]/30 bg-[var(--text-secondary)]/10",
  sla: "text-[var(--accent-red)] border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10",
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

        {/* Edit button */}
        <div className="pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
          <Link href={`/${locale}/workflow/${rule.id}/edit/`}>
            <Button variant="secondary" size="sm">
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
