"use client";

import { Badge } from "@uniflo/ui";
import type { TicketPriority } from "@uniflo/mock-data";

const priorityConfig = {
  critical: { label: "Critical", variant: "destructive" as const },
  high: { label: "High", variant: "warning" as const },
  medium: { label: "Medium", variant: "blue" as const },
  low: { label: "Low", variant: "success" as const },
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const config = priorityConfig[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
