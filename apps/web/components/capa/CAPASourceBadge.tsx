"use client";

import { Badge } from "@uniflo/ui";
import type { CAPASource } from "@uniflo/mock-data";

const sourceConfig: Record<CAPASource, { label: string; variant: "blue" | "warning" | "default" }> = {
  audit: { label: "Audit", variant: "blue" },
  ticket: { label: "Ticket", variant: "warning" },
  manual: { label: "Manual", variant: "default" },
};

export function CAPASourceBadge({ source }: { source: CAPASource }) {
  const config = sourceConfig[source];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
