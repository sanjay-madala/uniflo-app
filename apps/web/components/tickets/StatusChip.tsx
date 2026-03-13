"use client";

import { Badge } from "@uniflo/ui";
import type { TicketStatus } from "@uniflo/mock-data";

const statusConfig: Record<TicketStatus, { label: string; variant: "default" | "success" | "destructive" | "warning" | "blue"; className?: string }> = {
  open: { label: "Open", variant: "blue" },
  in_progress: { label: "In Progress", variant: "default", className: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "default" },
};

export function StatusChip({ status }: { status: TicketStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
