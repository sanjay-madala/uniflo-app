"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { automationRules as mockRules, ruleExecutions as mockExecutions, users } from "@uniflo/mock-data";
import type { AutomationRule, RuleExecution } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  EmptyState,
} from "@uniflo/ui";
import { Plus, Zap, LayoutGrid } from "lucide-react";
import { RuleCard } from "@/components/workflow/RuleCard";
import { RuleStatsBar } from "@/components/workflow/RuleStatsBar";

export default function WorkflowPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [triggerFilter, setTriggerFilter] = useState<string>("all");
  const [rules, setRules] = useState<AutomationRule[]>(mockRules as AutomationRule[]);
  const executions = mockExecutions as RuleExecution[];

  function handleToggle(ruleId: string, enabled: boolean) {
    setRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? { ...r, status: enabled ? "active" as const : "paused" as const }
          : r,
      ),
    );
  }

  const filtered = useMemo(() => {
    let result = [...rules];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        r => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(r => r.status === statusFilter);
    }
    if (moduleFilter !== "all") {
      result = result.filter(r => r.trigger.module === moduleFilter);
    }
    if (triggerFilter !== "all") {
      result = result.filter(r => r.trigger.event === triggerFilter);
    }

    // Sort: most recently created first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return result;
  }, [rules, search, statusFilter, moduleFilter, triggerFilter]);

  const hasActiveFilters = search || statusFilter !== "all" || moduleFilter !== "all" || triggerFilter !== "all";

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setModuleFilter("all");
    setTriggerFilter("all");
  }

  if (rules.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <PageHeader
          title="Automation"
          subtitle="Automate actions across tickets, audits, and CAPAs"
          className="px-0 py-0 border-0"
        />
        <EmptyState
          icon={<Zap className="h-6 w-6" />}
          title="No automation rules yet"
          description="Create your first rule to automate workflows across your operations."
          action={{ label: "Create Rule", onClick: () => {} }}
        />
        <div className="flex justify-center">
          <Link href={`/${locale}/workflow/templates/`}>
            <Button variant="secondary" size="sm">Browse Templates</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Automation"
        subtitle="Automate actions across tickets, audits, and CAPAs"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/workflow/templates/`}>
              <Button variant="secondary" size="sm">
                <LayoutGrid className="h-4 w-4" /> Templates
              </Button>
            </Link>
            <Link href={`/${locale}/workflow/new/`}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New Rule
              </Button>
            </Link>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      <RuleStatsBar rules={rules} executions={executions} />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search rules..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="tickets">Tickets</SelectItem>
            <SelectItem value="audits">Audits</SelectItem>
            <SelectItem value="capa">CAPA</SelectItem>
            <SelectItem value="tasks">Tasks</SelectItem>
            <SelectItem value="sops">SOPs</SelectItem>
            <SelectItem value="sla">SLA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={triggerFilter} onValueChange={setTriggerFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Trigger" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Triggers</SelectItem>
            <SelectItem value="ticket_created">Ticket Created</SelectItem>
            <SelectItem value="ticket_updated">Ticket Updated</SelectItem>
            <SelectItem value="ticket_closed">Ticket Closed</SelectItem>
            <SelectItem value="audit_completed">Audit Completed</SelectItem>
            <SelectItem value="audit_failed">Audit Failed</SelectItem>
            <SelectItem value="audit_score_below">Audit Score Below</SelectItem>
            <SelectItem value="capa_created">CAPA Created</SelectItem>
            <SelectItem value="capa_overdue">CAPA Overdue</SelectItem>
            <SelectItem value="capa_closed">CAPA Closed</SelectItem>
            <SelectItem value="task_overdue">Task Overdue</SelectItem>
            <SelectItem value="task_completed">Task Completed</SelectItem>
            <SelectItem value="sop_published">SOP Published</SelectItem>
            <SelectItem value="sla_breach">SLA Breach</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-[var(--accent-blue)] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="text-xs text-[var(--text-muted)]">
        {filtered.length === rules.length
          ? `${filtered.length} rule${filtered.length !== 1 ? "s" : ""} found`
          : `${filtered.length} of ${rules.length} rules shown`}
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {filtered.map(rule => (
          <RuleCard
            key={rule.id}
            rule={rule}
            locale={locale}
            onToggle={handleToggle}
          />
        ))}
      </div>

      {filtered.length === 0 && hasActiveFilters && (
        <EmptyState
          icon={<Zap className="h-6 w-6" />}
          title="No rules match your filters"
          description="Try adjusting your search or filter criteria."
          action={{ label: "Clear Filters", onClick: clearFilters }}
        />
      )}
    </div>
  );
}
