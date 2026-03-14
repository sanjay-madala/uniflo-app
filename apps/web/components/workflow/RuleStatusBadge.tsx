"use client";

import { Badge } from "@uniflo/ui";
import type { RuleStatus } from "@uniflo/mock-data";

const statusConfig: Record<RuleStatus, { label: string; variant: "default" | "success" | "destructive" | "warning" | "blue"; className?: string }> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "default" },
  draft: { label: "Draft", variant: "warning" },
  error: { label: "Error", variant: "destructive" },
};

export function RuleStatusBadge({ status }: { status: RuleStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
