"use client";

import { Badge } from "@uniflo/ui";
import type { CAPAStatus } from "@uniflo/mock-data";

const statusConfig: Record<CAPAStatus, { label: string; variant: "default" | "success" | "destructive" | "warning" | "blue"; className?: string }> = {
  open: { label: "Open", variant: "blue" },
  in_progress: { label: "In Progress", variant: "default", className: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  verified: { label: "Verified", variant: "warning" },
  closed: { label: "Closed", variant: "success" },
};

export function CAPAStatusChip({ status }: { status: CAPAStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className} role="status">
      {config.label}
    </Badge>
  );
}
