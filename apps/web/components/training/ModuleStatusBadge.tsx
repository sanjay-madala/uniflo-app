"use client";

import { Badge } from "@uniflo/ui";
import type { TrainingModuleStatus } from "@uniflo/mock-data";

const statusConfig: Record<TrainingModuleStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" | "blue" }> = {
  draft: { label: "Draft", variant: "default" },
  published: { label: "Published", variant: "success" },
  archived: { label: "Archived", variant: "warning" },
};

interface ModuleStatusBadgeProps {
  status: TrainingModuleStatus;
}

export function ModuleStatusBadge({ status }: ModuleStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
