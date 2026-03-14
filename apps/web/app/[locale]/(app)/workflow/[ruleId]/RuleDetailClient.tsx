"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { automationRules as mockRules, ruleExecutions as mockExecutions } from "@uniflo/mock-data";
import type { AutomationRule, RuleExecution } from "@uniflo/mock-data";
import { PageHeader, Button, Switch } from "@uniflo/ui";
import { Edit, ArrowLeft } from "lucide-react";
import { RuleStatusBadge } from "@/components/workflow/RuleStatusBadge";
import { RuleTriggerChip } from "@/components/workflow/RuleTriggerChip";
import { ExecutionTimeline } from "@/components/workflow/ExecutionTimeline";

const NOW = new Date("2026-03-13T12:00:00Z");

const userNames: Record<string, string> = {
  usr_001: "Sarah Chen",
  usr_002: "Marcus Johnson",
  usr_003: "Priya Sharma",
  usr_004: "Tom Riley",
  usr_005: "Ana Kowalski",
};

const locationLabels: Record<string, string> = {
  loc_001: "Downtown",
  loc_002: "Airport",
  loc_003: "Resort",
};

const operatorLabels: Record<string, string> = {
  equals: "equals",
  not_equals: "not equals",
  greater_than: ">",
  less_than: "<",
  contains: "contains",
  is_empty: "is empty",
  is_not_empty: "is not empty",
};

const actionTypeLabels: Record<string, string> = {
  create_ticket: "Create Ticket",
  create_capa: "Create CAPA",
  create_task: "Create Task",
  assign_to: "Assign To",
  send_notification: "Send Notification",
  change_status: "Change Status",
  add_tag: "Add Tag",
  update_field: "Update Field",
  trigger_audit: "Trigger Audit",
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

export default function RuleDetailClient() {
  const { locale, ruleId } = useParams<{ locale: string; ruleId: string }>();
  const allRules = mockRules as AutomationRule[];
  const allExecutions = mockExecutions as RuleExecution[];

  const foundRule = allRules.find(r => r.id === ruleId);
  const [rule, setRule] = useState<AutomationRule | null>(foundRule ?? null);

  const ruleExecutions = useMemo(
    () => allExecutions.filter(e => e.rule_id === ruleId),
    [allExecutions, ruleId],
  );

  if (!rule) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <PageHeader
          title="Rule Not Found"
          subtitle="This automation rule could not be found."
          breadcrumb={
            <Link href={`/${locale}/workflow/`} className="text-sm text-[var(--accent-blue)] hover:underline">
              <ArrowLeft className="inline h-3 w-3 mr-1" />Rules
            </Link>
          }
          className="px-0 py-0 border-0"
        />
      </div>
    );
  }

  function handleToggle(checked: boolean) {
    setRule(prev => {
      if (!prev) return prev;
      return { ...prev, status: checked ? "active" as const : "paused" as const };
    });
  }

  const twentyFourHoursAgo = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
  const last24h = ruleExecutions.filter(e => new Date(e.triggered_at) >= twentyFourHoursAgo).length;
  const successRate = rule.execution_count > 0
    ? Math.round((rule.success_count / rule.execution_count) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <PageHeader
        title={rule.name}
        subtitle={rule.description}
        breadcrumb={
          <Link href={`/${locale}/workflow/`} className="text-sm text-[var(--accent-blue)] hover:underline">
            <ArrowLeft className="inline h-3 w-3 mr-1" />Rules
          </Link>
        }
        actions={
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/workflow/${rule.id}/edit/`}>
              <Button variant="secondary" size="sm">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Switch
              checked={rule.status === "active"}
              onCheckedChange={handleToggle}
              disabled={rule.status === "draft" || rule.status === "error"}
              aria-label={`Enable rule ${rule.name}`}
            />
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Rule Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5">
        {/* Left: trigger, conditions, actions */}
        <div className="lg:col-span-3 space-y-4">
          {/* Trigger */}
          <div>
            <span className="text-xs font-medium text-[var(--text-muted)]">TRIGGER</span>
            <div className="mt-1 flex items-center gap-2">
              <RuleTriggerChip trigger={rule.trigger} />
            </div>
          </div>

          {/* Conditions */}
          <div>
            <span className="text-xs font-medium text-[var(--text-muted)]">CONDITIONS</span>
            {rule.conditions.length === 0 ? (
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                No conditions -- fires on every trigger event
              </p>
            ) : (
              <div className="mt-1 space-y-0.5">
                {rule.conditions.map((c, i) => (
                  <p key={c.id} className="text-xs text-[var(--text-secondary)]">
                    {i > 0 && <span className="text-[var(--accent-blue)] font-medium">AND </span>}
                    {c.field} {operatorLabels[c.operator]} {String(c.value)}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <span className="text-xs font-medium text-[var(--text-muted)]">ACTIONS</span>
            <div className="mt-1 space-y-0.5">
              {rule.actions.map((a, i) => (
                <p key={a.id} className="text-xs text-[var(--text-secondary)]">
                  {i + 1}. {actionTypeLabels[a.type] ?? a.type}
                  {a.config.title && (
                    <span className="text-[var(--text-muted)]"> - "{String(a.config.title)}"</span>
                  )}
                  {a.config.user_id && (
                    <span className="text-[var(--text-muted)]"> - {userNames[String(a.config.user_id)] ?? a.config.user_id}</span>
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right: metadata */}
        <div className="lg:col-span-2 space-y-3 lg:border-l lg:border-[var(--border-default)] lg:pl-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Status</span>
            <RuleStatusBadge status={rule.status} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Created</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {new Date(rule.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Last fired</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {timeAgo(rule.last_triggered_at)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Created by</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {userNames[rule.created_by] ?? rule.created_by}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Scope</span>
            <span className="text-xs text-[var(--text-secondary)]">
              {rule.location_scope.length === 0
                ? "All locations"
                : rule.location_scope.map(id => locationLabels[id] ?? id).join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* Execution Stats */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
        {[
          { label: "Total", value: rule.execution_count, color: "var(--text-primary)" },
          { label: `Success (${successRate}%)`, value: rule.success_count, color: "var(--accent-green)" },
          { label: "Failed", value: rule.failure_count, color: rule.failure_count > 0 ? "var(--accent-red)" : "var(--text-primary)" },
          { label: "Last 24h", value: last24h, color: "var(--accent-blue)" },
        ].map(stat => (
          <div
            key={stat.label}
            className="flex min-w-[120px] flex-1 flex-col rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3"
          >
            <span className="text-xs text-[var(--text-secondary)]">{stat.label}</span>
            <span className="mt-1 text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Execution Timeline */}
      <ExecutionTimeline executions={ruleExecutions} locale={locale} />
    </div>
  );
}
