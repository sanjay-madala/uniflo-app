"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { RuleExecution, ExecutionStatus } from "@uniflo/mock-data";
import { ExecutionStatusDot } from "./ExecutionStatusDot";

const statusLabels: Record<ExecutionStatus, string> = {
  success: "SUCCESS",
  partial: "PARTIAL",
  failed: "FAILED",
  skipped: "SKIPPED",
};

const statusTextColors: Record<ExecutionStatus, string> = {
  success: "text-[var(--accent-green)]",
  partial: "text-yellow-500",
  failed: "text-[var(--accent-red)]",
  skipped: "text-[var(--text-muted)]",
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getSourceRoute(id: string): string {
  if (id.startsWith("aud_")) return `/audit/${id}`;
  if (id.startsWith("tkt_")) return `/tickets/${id}`;
  if (id.startsWith("capa_")) return `/capa/${id}`;
  if (id.startsWith("task_")) return `/tasks/${id}`;
  if (id.startsWith("sop_")) return `/sop/${id}`;
  return "#";
}

function getResultRoute(actionType: string, resultId: string): string {
  if (actionType === "create_capa") return `/capa/${resultId}`;
  if (actionType === "create_ticket") return `/tickets/${resultId}`;
  if (actionType === "create_task") return `/tasks/${resultId}`;
  if (actionType === "trigger_audit") return `/audit/${resultId}`;
  return "#";
}

const actionLabels: Record<string, string> = {
  create_ticket: "Created Ticket",
  create_capa: "Created CAPA",
  create_task: "Created Task",
  assign_to: "Assigned",
  send_notification: "Notified",
  change_status: "Changed Status",
  add_tag: "Added Tag",
  update_field: "Updated Field",
  trigger_audit: "Triggered Audit",
};

interface ExecutionRowProps {
  execution: RuleExecution;
  locale: string;
  expanded: boolean;
  onToggle: () => void;
}

export function ExecutionRow({ execution, locale, expanded, onToggle }: ExecutionRowProps) {
  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)]">
      {/* Collapsed header */}
      <button
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-tertiary)] transition-colors"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        )}
        <ExecutionStatusDot status={execution.status} />
        <span className={`text-xs font-medium ${statusTextColors[execution.status]}`}>
          {statusLabels[execution.status]}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          {formatTimestamp(execution.triggered_at)}
        </span>
        <span className="ml-auto text-xs text-[var(--text-muted)]">
          Duration: {execution.duration_ms}ms
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[var(--border-default)] px-4 py-3 space-y-2">
          <div className="text-xs text-[var(--text-secondary)]">
            <span className="text-[var(--text-muted)]">Triggered by: </span>
            <Link
              href={`/${locale}${getSourceRoute(execution.trigger_source_id)}/`}
              className="text-[var(--accent-blue)] hover:underline"
            >
              {execution.trigger_source_label}
            </Link>
            <span className="text-[var(--text-muted)]"> ({execution.trigger_source_id})</span>
          </div>

          {!execution.conditions_met && (
            <p className="text-xs text-[var(--text-muted)]">
              Conditions were not met. Rule execution was skipped.
            </p>
          )}

          {execution.actions_executed.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Actions:</span>
              {execution.actions_executed.map((action, i) => (
                <div key={i} className="flex items-start gap-2 text-xs pl-2">
                  <ExecutionStatusDot status={action.status} />
                  <div>
                    <span className="text-[var(--text-secondary)]">
                      {actionLabels[action.action_type] ?? action.action_type}
                    </span>
                    {action.result_label && action.result_id && (
                      <>
                        {": "}
                        <Link
                          href={`/${locale}${getResultRoute(action.action_type, action.result_id)}/`}
                          className="text-[var(--accent-blue)] hover:underline"
                        >
                          {action.result_label}
                        </Link>
                        <span className="text-[var(--text-muted)]"> ({action.result_id})</span>
                      </>
                    )}
                    {action.error && (
                      <span className="text-[var(--accent-red)]"> - {action.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
