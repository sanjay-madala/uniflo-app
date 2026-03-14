"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import type { CAPAStatus } from "@uniflo/mock-data";

interface CAPAStatusTimelineProps {
  status: CAPAStatus;
  variant: "full" | "compact";
  dates?: {
    opened_at?: string;
    in_progress_at?: string;
    verified_at?: string;
    closed_at?: string;
  };
  animating?: boolean;
  className?: string;
}

const STAGES: { key: CAPAStatus; label: string; index: number }[] = [
  { key: "open", label: "Open", index: 0 },
  { key: "in_progress", label: "In Progress", index: 1 },
  { key: "verified", label: "Verified", index: 2 },
  { key: "closed", label: "Closed", index: 3 },
];

const CURRENT_COLORS: Record<CAPAStatus, string> = {
  open: "#58A6FF",
  in_progress: "#BC8CFF",
  verified: "#D29922",
  closed: "#3FB950",
};

const SUCCESS_COLOR = "#3FB950";
const BORDER_COLOR = "#30363D";
const MUTED_COLOR = "#484F58";

function formatDate(dateStr?: string): string {
  if (!dateStr) return "---";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CAPAStatusTimeline({ status, variant, dates, animating, className }: CAPAStatusTimelineProps) {
  const currentIndex = useMemo(() => STAGES.findIndex(s => s.key === status), [status]);

  const dateMap: Record<string, string | undefined> = useMemo(() => ({
    open: dates?.opened_at,
    in_progress: dates?.in_progress_at,
    verified: dates?.verified_at,
    closed: dates?.closed_at,
  }), [dates]);

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-0.5 ${className ?? ""}`} role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={4} aria-label={`CAPA status: ${STAGES[currentIndex].label}`}>
        {STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const dotColor = isCompleted ? SUCCESS_COLOR : isCurrent ? CURRENT_COLORS[status] : "transparent";
          const dotSize = isCurrent ? "w-2.5 h-2.5" : "w-2 h-2";
          const borderStyle = !isCompleted && !isCurrent ? `2px solid ${BORDER_COLOR}` : "none";

          return (
            <div key={stage.key} className="flex items-center">
              <div
                className={`rounded-full ${dotSize} shrink-0`}
                style={{
                  backgroundColor: dotColor,
                  border: borderStyle,
                }}
                aria-label={`Stage ${i + 1} of 4: ${stage.label}${isCurrent ? ", current" : isCompleted ? ", completed" : ""}`}
              />
              {i < STAGES.length - 1 && (
                <div
                  className="h-0.5 w-3"
                  style={{
                    backgroundColor: i < currentIndex ? SUCCESS_COLOR : BORDER_COLOR,
                    ...(i < currentIndex ? {} : { backgroundImage: `repeating-linear-gradient(90deg, ${BORDER_COLOR} 0, ${BORDER_COLOR} 2px, transparent 2px, transparent 4px)`, backgroundColor: "transparent" }),
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={`flex items-start justify-between py-6 ${className ?? ""}`}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemax={4}
      aria-label={`CAPA progress: Stage ${currentIndex + 1} of 4, ${STAGES[currentIndex].label}`}
    >
      {STAGES.map((stage, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;

        const nodeColor = isCompleted
          ? SUCCESS_COLOR
          : isCurrent
            ? CURRENT_COLORS[status]
            : "transparent";

        const labelColor = isCompleted
          ? SUCCESS_COLOR
          : isCurrent
            ? CURRENT_COLORS[status]
            : MUTED_COLOR;

        return (
          <div key={stage.key} className="flex flex-1 items-start">
            {/* Node + label column */}
            <div className="flex flex-col items-center" style={{ minWidth: "40px" }}>
              {/* Node */}
              <div className="relative flex items-center justify-center">
                {/* Pulsing ring for current stage */}
                {isCurrent && (
                  <span
                    className="absolute inset-0 rounded-full animate-capa-pulse"
                    style={{
                      backgroundColor: CURRENT_COLORS[status],
                      width: "36px",
                      height: "36px",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                )}
                <div
                  className={`relative z-10 flex items-center justify-center rounded-full ${isCurrent ? "h-9 w-9" : "h-8 w-8"}`}
                  style={{
                    backgroundColor: nodeColor,
                    border: isFuture ? `2px solid ${BORDER_COLOR}` : "none",
                    transition: animating ? "all 600ms ease-out" : undefined,
                  }}
                  aria-label={`Stage ${i + 1} of 4: ${stage.label}${isCurrent ? ", current" : isCompleted ? ", completed" : ""}`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: isFuture ? MUTED_COLOR : "white" }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
              </div>

              {/* Label */}
              <span
                className="mt-2 text-xs font-medium text-center"
                style={{ color: labelColor }}
              >
                {stage.label}
              </span>

              {/* Date */}
              <span className="text-xs text-center" style={{ color: MUTED_COLOR }}>
                {formatDate(dateMap[stage.key])}
              </span>
            </div>

            {/* Connector line */}
            {i < STAGES.length - 1 && (
              <div className="flex-1 flex items-center pt-4">
                <div
                  className="h-0.5 w-full"
                  style={{
                    transition: animating ? "all 600ms ease-out" : undefined,
                    ...(i < currentIndex
                      ? { backgroundColor: SUCCESS_COLOR }
                      : i === currentIndex
                        ? { background: `linear-gradient(to right, ${CURRENT_COLORS[status]}, ${BORDER_COLOR})` }
                        : { backgroundImage: `repeating-linear-gradient(90deg, ${BORDER_COLOR} 0, ${BORDER_COLOR} 4px, transparent 4px, transparent 8px)`, backgroundColor: "transparent" }),
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes capa-pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
        }
        .animate-capa-pulse {
          animation: capa-pulse 2s ease-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-capa-pulse {
            animation: none;
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
