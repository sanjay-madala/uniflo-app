"use client";

import type { PortalTicketStatus } from "@uniflo/mock-data";
import { Check } from "lucide-react";

const steps: { key: PortalTicketStatus; label: string }[] = [
  { key: "submitted", label: "Submitted" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

const statusOrder: Record<PortalTicketStatus, number> = {
  submitted: 0,
  in_progress: 1,
  awaiting_reply: 1,
  resolved: 2,
  closed: 3,
};

interface StatusTrackerProps {
  status: PortalTicketStatus;
  dates?: Record<string, string>;
}

export function StatusTracker({ status, dates = {} }: StatusTrackerProps) {
  const currentIndex = statusOrder[status];

  return (
    <div
      className="rounded-lg border p-6"
      style={{
        backgroundColor: "var(--portal-surface)",
        borderColor: "var(--portal-border)",
      }}
    >
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const stepIndex = statusOrder[step.key];
          const isCompleted = stepIndex < currentIndex;
          const isCurrent = stepIndex === currentIndex;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: isCompleted
                      ? "var(--portal-success)"
                      : isCurrent
                        ? "var(--portal-accent)"
                        : "transparent",
                    borderWidth: isCompleted || isCurrent ? 0 : 2,
                    borderStyle: "solid",
                    borderColor: "var(--portal-border)",
                    color: isCompleted || isCurrent ? "#FFFFFF" : "var(--portal-text-muted)",
                    boxShadow: isCurrent ? "0 0 0 4px rgba(37,99,235,0.2)" : "none",
                    animation: isCurrent ? "pulse 2s ease-in-out infinite" : "none",
                  }}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isCompleted || isCurrent
                      ? "var(--portal-text-primary)"
                      : "var(--portal-text-muted)",
                  }}
                >
                  {step.label}
                </span>
                {dates[step.key] && (
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--portal-text-muted)" }}
                  >
                    {new Date(dates[step.key]).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="mx-2 h-0.5 flex-1"
                  style={{
                    backgroundColor: stepIndex < currentIndex
                      ? "var(--portal-success)"
                      : "var(--portal-border)",
                    borderStyle: stepIndex >= currentIndex ? "dashed" : "solid",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
