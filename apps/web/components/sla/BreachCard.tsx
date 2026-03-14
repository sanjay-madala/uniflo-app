"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { SLABreach } from "@uniflo/mock-data";
import { Button, Badge } from "@uniflo/ui";
import { ExternalLink } from "lucide-react";
import { BreachSeverityDot } from "./BreachSeverityDot";
import { BreachCountdownTimer } from "./BreachCountdownTimer";
import { PolicyModuleBadge } from "./PolicyModuleBadge";

interface BreachCardProps {
  breach: SLABreach;
  onReassign?: (breachId: string) => void;
  onEscalate?: (breachId: string) => void;
  onAcknowledge?: (breachId: string) => void;
  isResolved?: boolean;
}

const statusLabels: Record<string, string> = {
  breached: "BREACHED",
  at_risk: "AT RISK",
  escalated: "ESCALATED",
  resolved: "RESOLVED",
};

const borderColors: Record<string, string> = {
  breached: "var(--accent-red)",
  at_risk: "var(--accent-yellow, #EAB308)",
  escalated: "var(--accent-purple, #BC8CFF)",
  resolved: "var(--accent-green)",
};

function getItemRoute(module: string, itemId: string): string {
  switch (module) {
    case "tickets":
      return `/tickets/${itemId}`;
    case "audits":
      return `/audit/${itemId}`;
    case "capa":
      return `/capa/${itemId}`;
    default:
      return "#";
  }
}

export function BreachCard({
  breach,
  onReassign,
  onEscalate,
  onAcknowledge,
  isResolved = false,
}: BreachCardProps) {
  const { locale } = useParams<{ locale: string }>();
  const borderColor = borderColors[breach.breach_status] ?? "var(--border-default)";
  const itemRoute = `/${locale}${getItemRoute(breach.module, breach.item_id)}`;

  return (
    <div
      className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4"
      style={{ borderInlineStartWidth: "4px", borderInlineStartColor: borderColor }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <BreachSeverityDot status={breach.breach_status} />
        <Badge className="text-xs">{statusLabels[breach.breach_status]}</Badge>
        <div className="flex-1" />
        <Link
          href={itemRoute}
          className="inline-flex items-center gap-1 text-xs text-[var(--accent-blue)] hover:underline"
        >
          View <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Title */}
      <Link
        href={itemRoute}
        className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
      >
        {breach.item_id.replace(/^tkt_/, "TKT-").replace(/^aud_/, "AUD-").replace(/^capa_/, "CAPA-")}:{" "}
        {breach.item_title}
      </Link>
      <div className="mt-1 flex items-center gap-2">
        <PolicyModuleBadge module={breach.module} />
        {breach.item_priority && (
          <Badge
            className="text-xs"
            style={{
              backgroundColor:
                breach.item_priority === "critical"
                  ? "var(--accent-red)"
                  : breach.item_priority === "high"
                    ? "var(--accent-yellow, #EAB308)"
                    : "var(--bg-tertiary)",
              color:
                breach.item_priority === "critical" || breach.item_priority === "high"
                  ? "#fff"
                  : "var(--text-secondary)",
            }}
          >
            {breach.item_priority}
          </Badge>
        )}
      </div>

      {/* Metric and countdown */}
      <div className="mt-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-2">
          <span>Metric: {breach.metric_label}</span>
          <span>
            Target: {breach.target_value} {breach.target_unit}
          </span>
        </div>
        <BreachCountdownTimer
          remainingMs={breach.remaining_ms}
          targetValue={breach.target_value}
          targetUnit={breach.target_unit}
        />
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Elapsed: {breach.elapsed_value} {breach.elapsed_unit}
        </p>
      </div>

      {/* Metadata */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
        <span>
          Assignee:{" "}
          <span className="text-[var(--text-primary)]">{breach.assignee_name || "Unassigned"}</span>
        </span>
        <span>
          Location:{" "}
          <span className="text-[var(--text-primary)]">{breach.location_name}</span>
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">
        SLA Clock Started:{" "}
        {new Date(breach.started_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>
      <p className="text-xs text-[var(--text-muted)]">
        Policy: {breach.policy_name}
      </p>

      {/* Actions */}
      {!isResolved && (
        <>
          <div className="my-3 border-t border-[var(--border-default)]" />
          <div className="flex flex-wrap gap-2">
            {onReassign && (
              <Button variant="secondary" size="sm" onClick={() => onReassign(breach.id)}>
                Reassign
              </Button>
            )}
            {onEscalate && breach.breach_status === "breached" && (
              <Button variant="secondary" size="sm" onClick={() => onEscalate(breach.id)}>
                Escalate
              </Button>
            )}
            {onAcknowledge && breach.breach_status === "breached" && (
              <Button variant="secondary" size="sm" onClick={() => onAcknowledge(breach.id)}>
                Acknowledge
              </Button>
            )}
          </div>
        </>
      )}

      {/* Resolved info */}
      {isResolved && breach.resolved_at && (
        <p className="mt-2 text-xs text-[var(--accent-green)]">
          Resolved:{" "}
          {new Date(breach.resolved_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
