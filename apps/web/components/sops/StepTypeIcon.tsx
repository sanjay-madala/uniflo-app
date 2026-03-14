"use client";

import type { SOPStepType } from "@uniflo/mock-data";
import { ClipboardList, GitBranch, AlertTriangle, BookOpen, CheckSquare } from "lucide-react";

const stepTypeConfig: Record<SOPStepType, { icon: typeof ClipboardList; label: string }> = {
  instruction: { icon: ClipboardList, label: "Instruction" },
  decision:    { icon: GitBranch,     label: "Decision" },
  warning:     { icon: AlertTriangle, label: "Warning" },
  reference:   { icon: BookOpen,      label: "Reference" },
  checklist:   { icon: CheckSquare,   label: "Checklist" },
};

interface StepTypeIconProps {
  type: SOPStepType;
  className?: string;
}

export function StepTypeIcon({ type, className = "h-4 w-4" }: StepTypeIconProps) {
  const config = stepTypeConfig[type];
  const Icon = config.icon;
  return <Icon className={className} aria-label={config.label} />;
}

export function getStepTypeLabel(type: SOPStepType): string {
  return stepTypeConfig[type].label;
}
