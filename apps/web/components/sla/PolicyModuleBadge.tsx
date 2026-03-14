"use client";

import { Ticket, ClipboardCheck, AlertTriangle } from "lucide-react";
import type { SLAModule } from "@uniflo/mock-data";

const moduleConfig: Record<SLAModule, { label: string; color: string; Icon: typeof Ticket }> = {
  tickets: { label: "Tickets", color: "var(--accent-blue)", Icon: Ticket },
  audits: { label: "Audits", color: "var(--accent-purple)", Icon: ClipboardCheck },
  capa: { label: "CAPA", color: "var(--accent-yellow)", Icon: AlertTriangle },
};

interface PolicyModuleBadgeProps {
  module: SLAModule;
}

export function PolicyModuleBadge({ module }: PolicyModuleBadgeProps) {
  const config = moduleConfig[module];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `color-mix(in srgb, ${config.color} 15%, transparent)`, color: config.color }}
    >
      <config.Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
