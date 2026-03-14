"use client";

import { ChevronDown } from "lucide-react";

interface FlowConnectorProps {
  variant?: "solid" | "dashed";
}

export function FlowConnector({ variant = "solid" }: FlowConnectorProps) {
  return (
    <div className="flex flex-col items-center py-1 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200">
      <div
        className="h-8 w-0.5"
        style={{
          backgroundColor: variant === "solid" ? "var(--border-default)" : undefined,
          borderLeft: variant === "dashed" ? "2px dashed var(--border-default)" : undefined,
        }}
      />
      <ChevronDown className="h-3 w-3 text-[var(--text-muted)]" />
    </div>
  );
}
