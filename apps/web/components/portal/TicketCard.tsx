"use client";

import type { PortalTicket, PortalTicketStatus } from "@uniflo/mock-data";

const statusConfig: Record<PortalTicketStatus, { label: string; color: string; bg: string }> = {
  submitted: { label: "Submitted", color: "var(--portal-accent)", bg: "rgba(37,99,235,0.1)" },
  in_progress: { label: "In Progress", color: "var(--portal-warning)", bg: "rgba(217,119,6,0.1)" },
  awaiting_reply: { label: "Awaiting Reply", color: "var(--portal-warning)", bg: "rgba(217,119,6,0.1)" },
  resolved: { label: "Resolved", color: "var(--portal-success)", bg: "rgba(5,150,105,0.1)" },
  closed: { label: "Closed", color: "var(--portal-text-muted)", bg: "rgba(156,163,175,0.1)" },
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  medium: { label: "Medium", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  low: { label: "Low", color: "#059669", bg: "rgba(5,150,105,0.1)" },
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date("2026-03-14T12:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TicketCardProps {
  ticket: PortalTicket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border p-4 text-left transition-all duration-150"
      style={{
        backgroundColor: "var(--portal-surface)",
        borderColor: "var(--portal-border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--portal-surface-elevated)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--portal-surface)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="shrink-0 font-mono text-xs"
              style={{ color: "var(--portal-text-muted)" }}
            >
              {ticket.id.replace("tkt_", "TKT-")}
            </span>
          </div>
          <h3
            className="mt-1 text-sm font-semibold leading-snug"
            style={{ color: "var(--portal-text-primary)" }}
          >
            {ticket.title}
          </h3>
        </div>
        <span
          className="shrink-0 text-xs"
          style={{ color: "var(--portal-text-muted)" }}
        >
          Updated {formatRelativeTime(ticket.updated_at)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ color: priority.color, backgroundColor: priority.bg }}
        >
          {priority.label}
        </span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {status.label}
        </span>
      </div>
    </button>
  );
}
