"use client";

import { Badge } from "@uniflo/ui";
import type { TaskStatus } from "@uniflo/mock-data";

const statusConfig: Record<TaskStatus, { label: string; variant: "default" | "success" | "destructive" | "warning" | "blue"; className?: string }> = {
  todo: { label: "To Do", variant: "default" },
  in_progress: { label: "In Progress", variant: "blue" },
  in_review: { label: "In Review", variant: "default", className: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  done: { label: "Done", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive", className: "line-through" },
};

export function TaskStatusChip({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
