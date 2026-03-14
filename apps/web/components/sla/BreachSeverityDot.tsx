"use client";

import type { SLABreachStatus } from "@uniflo/mock-data";

interface BreachSeverityDotProps {
  status: SLABreachStatus;
}

const dotColors: Record<SLABreachStatus, string> = {
  breached: "var(--accent-red)",
  at_risk: "var(--accent-yellow, #EAB308)",
  escalated: "var(--accent-purple, #BC8CFF)",
  resolved: "var(--accent-green)",
};

export function BreachSeverityDot({ status }: BreachSeverityDotProps) {
  const color = dotColors[status];
  const shouldPulse = status === "breached";

  return (
    <span
      className="relative inline-flex h-3 w-3 shrink-0"
      aria-label={status.replace("_", " ")}
    >
      {shouldPulse && (
        <span
          className="absolute inset-0 rounded-full opacity-75 motion-safe:animate-ping"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}
