"use client";

import { Badge } from "@uniflo/ui";
import type { CAPASeverity } from "@uniflo/mock-data";

const severityConfig: Record<CAPASeverity, { label: string; variant: "destructive" | "warning" | "blue" | "success" }> = {
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "warning" },
  medium: { label: "Medium", variant: "blue" },
  low: { label: "Low", variant: "success" },
};

export function CAPASeverityBadge({ severity }: { severity: CAPASeverity }) {
  const config = severityConfig[severity];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
