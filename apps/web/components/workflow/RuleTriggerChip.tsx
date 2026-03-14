"use client";

import { Badge } from "@uniflo/ui";
import type { RuleTrigger } from "@uniflo/mock-data";
import {
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

const moduleColors: Record<string, string> = {
  tickets: "text-[var(--accent-blue)] border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/10",
  audits: "text-[var(--accent-green)] border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10",
  capa: "text-[var(--accent-yellow)] border-[var(--accent-yellow)]/30 bg-[var(--accent-yellow)]/10",
  tasks: "text-[var(--accent-purple)] border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/10",
  sops: "text-[var(--text-secondary)] border-[var(--text-secondary)]/30 bg-[var(--text-secondary)]/10",
  sla: "text-[var(--accent-red)] border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10",
};

export function RuleTriggerChip({ trigger }: { trigger: RuleTrigger }) {
  const Icon = iconMap[trigger.icon] ?? ClipboardCheck;
  const colorClass = moduleColors[trigger.module] ?? moduleColors.tickets;

  return (
    <Badge variant="default" className={colorClass}>
      <Icon className="h-3 w-3 mr-1" />
      {trigger.label}
    </Badge>
  );
}
