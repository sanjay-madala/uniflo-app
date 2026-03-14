"use client";

import { Badge } from "@uniflo/ui";
import type { TaskPriority } from "@uniflo/mock-data";

const priorityConfig: Record<TaskPriority, { label: string; variant: "destructive" | "warning" | "blue" | "success" }> = {
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "warning" },
  medium: { label: "Medium", variant: "blue" },
  low: { label: "Low", variant: "success" },
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
