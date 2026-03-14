"use client";

import { Badge } from "@uniflo/ui";
import type { SOPStatus } from "@uniflo/mock-data";

const sopStatusConfig: Record<SOPStatus, { label: string; variant: "default" | "success" | "destructive" | "warning" | "blue"; className?: string }> = {
  draft:      { label: "Draft",      variant: "default" },
  in_review:  { label: "In Review",  variant: "warning" },
  published:  { label: "Published",  variant: "success" },
  archived:   { label: "Archived",   variant: "default", className: "line-through opacity-60" },
};

export function SOPStatusChip({ status }: { status: SOPStatus }) {
  const config = sopStatusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className} role="status">
      {config.label}
    </Badge>
  );
}
