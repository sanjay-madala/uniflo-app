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
  tickets: "text-[#58A6FF] border-[#58A6FF]/30 bg-[#58A6FF]/10",
  audits: "text-[#3FB950] border-[#3FB950]/30 bg-[#3FB950]/10",
  capa: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10",
  tasks: "text-[#BC8CFF] border-[#BC8CFF]/30 bg-[#BC8CFF]/10",
  sops: "text-[var(--text-secondary)] border-[var(--text-secondary)]/30 bg-[var(--text-secondary)]/10",
  sla: "text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10",
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
