"use client";

import { useState } from "react";
import { Card, CardContent, Badge } from "@uniflo/ui";
import type { RuleTrigger, TriggerEvent } from "@uniflo/mock-data";
import {
  Zap,
  ClipboardCheck,
  ClipboardList,
  ClipboardX,
  AlertTriangle,
  CheckSquare,
  FileText,
  Clock,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck,
  ClipboardList,
  ClipboardX,
  AlertTriangle,
  CheckSquare,
  FileText,
  Clock,
};

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

const moduleDotColors: Record<string, string> = {
  tickets: "bg-[#58A6FF]",
  audits: "bg-[#3FB950]",
  capa: "bg-[#D29922]",
  tasks: "bg-[#BC8CFF]",
  sops: "bg-[var(--text-secondary)]",
  sla: "bg-[#F85149]",
};

interface TriggerOption {
  event: TriggerEvent;
  label: string;
  icon: string;
  module: "tickets" | "audits" | "capa" | "tasks" | "sops" | "sla";
  description: string;
}

const triggerOptions: TriggerOption[] = [
  { event: "audit_completed", label: "Audit completed", icon: "ClipboardCheck", module: "audits", description: "When an audit is completed" },
  { event: "audit_failed", label: "Audit failed", icon: "ClipboardX", module: "audits", description: "When an audit fails" },
  { event: "audit_score_below", label: "Audit score below threshold", icon: "ClipboardCheck", module: "audits", description: "When audit score is below a threshold" },
  { event: "ticket_created", label: "Ticket created", icon: "ClipboardList", module: "tickets", description: "When a new ticket is created" },
  { event: "ticket_updated", label: "Ticket updated", icon: "ClipboardList", module: "tickets", description: "When a ticket is updated" },
  { event: "ticket_closed", label: "Ticket closed", icon: "ClipboardList", module: "tickets", description: "When a ticket is closed" },
  { event: "capa_created", label: "CAPA created", icon: "AlertTriangle", module: "capa", description: "When a CAPA is created" },
  { event: "capa_overdue", label: "CAPA overdue", icon: "AlertTriangle", module: "capa", description: "When a CAPA passes its due date" },
  { event: "capa_closed", label: "CAPA closed", icon: "AlertTriangle", module: "capa", description: "When a CAPA is closed" },
  { event: "task_overdue", label: "Task overdue", icon: "CheckSquare", module: "tasks", description: "When a task passes its due date" },
  { event: "task_completed", label: "Task completed", icon: "CheckSquare", module: "tasks", description: "When a task is completed" },
  { event: "sop_published", label: "SOP published", icon: "FileText", module: "sops", description: "When a SOP is published or updated" },
  { event: "sla_breach", label: "SLA breach", icon: "Clock", module: "sla", description: "When an SLA is breached" },
];

const moduleOrder: Array<"audits" | "tickets" | "capa" | "tasks" | "sops" | "sla"> = [
  "audits", "tickets", "capa", "tasks", "sops", "sla",
];

interface TriggerBlockProps {
  trigger: RuleTrigger | null;
  onSelect: (trigger: RuleTrigger) => void;
  error?: string;
}

export function TriggerBlock({ trigger, onSelect, error }: TriggerBlockProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  function handleSelect(option: TriggerOption) {
    onSelect({
      event: option.event,
      label: option.label,
      icon: option.icon,
      module: option.module,
    });
    setShowDropdown(false);
  }

  // Empty state
  if (!trigger || showDropdown) {
    return (
      <Card
        className={`border-dashed ${error ? "border-[var(--accent-red)]" : ""}`}
        role="region"
        aria-label="Trigger configuration"
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Select a trigger event
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Choose what starts this automation rule.
          </p>
          {error && <p className="text-xs text-[var(--accent-red)] mb-2">{error}</p>}

          {/* Grouped dropdown */}
          <div className="max-h-64 overflow-y-auto rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)]">
            {moduleOrder.map(mod => {
              const options = triggerOptions.filter(o => o.module === mod);
              if (options.length === 0) return null;
              return (
                <div key={mod}>
                  <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                    {moduleLabels[mod]}
                  </div>
                  {options.map(option => (
                    <button
                      key={option.event}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-secondary)] transition-colors"
                      onClick={() => handleSelect(option)}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${moduleDotColors[mod]}`} />
                      <span className="text-xs text-[var(--text-primary)]">{option.label}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filled state
  const Icon = iconMap[trigger.icon] ?? ClipboardCheck;
  const triggerOption = triggerOptions.find(o => o.event === trigger.event);

  return (
    <Card role="region" aria-label="Trigger configuration">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-6 w-6 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">{trigger.label}</span>
          </div>
          <Badge variant="default" className={moduleBadgeColors[trigger.module]}>
            {moduleLabels[trigger.module]}
          </Badge>
        </div>
        {triggerOption && (
          <p className="mt-2 text-xs text-[var(--text-secondary)]">
            {triggerOption.description}
          </p>
        )}
        <button
          onClick={() => setShowDropdown(true)}
          className="mt-2 text-xs text-[var(--accent-blue)] hover:underline"
        >
          Change trigger
        </button>
      </CardContent>
    </Card>
  );
}
