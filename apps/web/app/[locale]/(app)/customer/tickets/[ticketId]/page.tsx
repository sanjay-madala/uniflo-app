"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Paperclip, Send, Loader2, Star } from "lucide-react";
import { portalTickets, portalTimeline } from "@uniflo/mock-data";
import type {
  PortalTicket,
  PortalTimelineEntry,
  PortalTicketStatus,
  PortalAttachment,
} from "@uniflo/mock-data";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalFooter } from "@/components/portal/PortalFooter";
import { StatusTracker } from "@/components/portal/StatusTracker";
import { ActivityTimeline } from "@/components/portal/ActivityTimeline";
import { StarRating } from "@/components/portal/StarRating";

const statusLabels: Record<PortalTicketStatus, string> = {
  submitted: "Submitted",
  in_progress: "In Progress",
  awaiting_reply: "Awaiting Reply",
  resolved: "Resolved",
  closed: "Closed",
};

const priorityColors: Record<string, string> = {
  high: "#DC2626",
  medium: "#D97706",
  low: "#059669",
};

const categoryLabels: Record<string, string> = {
  fb: "F&B",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  compliance: "Compliance",
  guest_relations: "Guest Relations",
  general: "General",
};

export default function TicketStatusPage() {
  const { locale, ticketId } = useParams<{ locale: string; ticketId: string }>();
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [csatRating, setCsatRating] = useState<number | null>(null);
  const [csatComment, setCsatComment] = useState("");
  const [csatSubmitted, setCsatSubmitted] = useState(false);
  const [csatDismissed, setCsatDismissed] = useState(false);

  const ticket = useMemo(
    () => (portalTickets as PortalTicket[]).find((t) => t.id === ticketId) ?? null,
    [ticketId]
  );

  const timeline = useMemo(
    () =>
      (portalTimeline as PortalTimelineEntry[]).filter(
        (e) => e.ticket_id === ticketId
      ),
    [ticketId]
  );

  if (!ticket) {
    return (
      <div
        className="flex min-h-screen flex-col"
        style={
          {
            "--portal-bg": "#FFFFFF",
            "--portal-surface": "#F9FAFB",
            "--portal-border": "#E5E7EB",
            "--portal-text-primary": "#111827",
            "--portal-text-secondary": "#6B7280",
            "--portal-text-muted": "#9CA3AF",
            "--portal-accent": "#2563EB",
            "--portal-success": "#059669",
            "--portal-warning": "#D97706",
            "--portal-danger": "#DC2626",
          } as React.CSSProperties
        }
      >
        <PortalHeader
          title="Ticket Not Found"
          backLabel="Back to Tickets"
          backHref={`/${locale}/customer`}
        />
        <main className="flex flex-1 items-center justify-center">
          <p style={{ color: "var(--portal-text-secondary)" }}>
            Ticket not found.
          </p>
        </main>
        <PortalFooter />
      </div>
    );
  }

  const isResolved = ticket.status === "resolved";
  const isClosed = ticket.status === "closed";
  const showCsatSurvey = isResolved && !csatSubmitted && !csatDismissed && !ticket.csat_score;

  function handleSendReply() {
    if (!replyText.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setReplyText("");
    }, 800);
  }

  function handleCsatSubmit() {
    if (!csatRating) return;
    setCsatSubmitted(true);
  }

  return (
    <div
      className="flex min-h-screen flex-col"
      style={
        {
          "--portal-bg": "#FFFFFF",
          "--portal-surface": "#F9FAFB",
          "--portal-surface-elevated": "#FFFFFF",
          "--portal-border": "#E5E7EB",
          "--portal-text-primary": "#111827",
          "--portal-text-secondary": "#6B7280",
          "--portal-text-muted": "#9CA3AF",
          "--portal-accent": "#2563EB",
          "--portal-success": "#059669",
          "--portal-warning": "#D97706",
          "--portal-danger": "#DC2626",
        } as React.CSSProperties
      }
    >
      <PortalHeader
        title={`Ticket ${ticket.id.replace("tkt_", "TKT-")}`}
        backLabel="Back to Tickets"
        backHref={`/${locale}/customer`}
      />

      <main className="mx-auto w-full max-w-[960px] flex-1 px-6 py-8">
        {/* Ticket title + metadata */}
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--portal-text-primary)" }}
        >
          {ticket.title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--portal-text-secondary)" }}>
          Submitted{" "}
          {new Date(ticket.created_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
          {" \u00B7 "}
          Category: {categoryLabels[ticket.category] ?? ticket.category}
        </p>

        {/* Status Tracker */}
        <div className="mt-6">
          <StatusTracker
            status={ticket.status}
            dates={{
              submitted: ticket.created_at,
              ...(ticket.status !== "submitted" ? { in_progress: ticket.updated_at } : {}),
              ...(ticket.resolved_at ? { resolved: ticket.resolved_at } : {}),
            }}
          />
        </div>

        {/* Two-column layout */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Timeline */}
          <div className="lg:col-span-2">
            {/* CSAT Survey inline prompt */}
            {showCsatSurvey && (
              <div
                className="mb-6 rounded-lg border p-4"
                style={{
                  backgroundColor: "var(--portal-surface)",
                  borderColor: "var(--portal-border)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" style={{ color: "var(--portal-accent)" }} />
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--portal-text-primary)" }}
                  >
                    Rate your experience
                  </h3>
                </div>
                <div className="mt-3">
                  <StarRating value={csatRating} onChange={setCsatRating} />
                </div>
                {csatRating !== null && csatRating > 0 && (
                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder={
                        csatRating <= 3
                          ? "What could we have done better?"
                          : "What made this experience great?"
                      }
                      value={csatComment}
                      onChange={(e) => setCsatComment(e.target.value)}
                      className="h-9 w-full rounded-lg border px-3 text-sm outline-none"
                      style={{
                        backgroundColor: "var(--portal-bg)",
                        borderColor: "var(--portal-border)",
                        color: "var(--portal-text-primary)",
                      }}
                    />
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleCsatSubmit}
                    disabled={!csatRating || csatRating === 0}
                    className="rounded-lg px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
                    style={{ backgroundColor: "var(--portal-accent)" }}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setCsatDismissed(true)}
                    className="rounded-lg px-4 py-1.5 text-sm"
                    style={{ color: "var(--portal-text-muted)" }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {csatSubmitted && (
              <div
                className="mb-6 rounded-lg border p-4 text-center"
                style={{
                  backgroundColor: "rgba(5,150,105,0.05)",
                  borderColor: "var(--portal-success)",
                }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--portal-success)" }}>
                  Thank you for your feedback!
                </p>
              </div>
            )}

            {/* Activity Timeline */}
            <div
              className="rounded-lg border p-5"
              style={{
                backgroundColor: "var(--portal-surface)",
                borderColor: "var(--portal-border)",
              }}
            >
              <h2
                className="mb-4 text-sm font-semibold"
                style={{ color: "var(--portal-text-primary)" }}
              >
                Activity
              </h2>
              <ActivityTimeline entries={timeline} />

              {/* Reply box */}
              {isResolved && !isClosed && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--portal-border)" }}>
                  <p className="text-sm" style={{ color: "var(--portal-text-muted)" }}>
                    This ticket is resolved.{" "}
                    <button
                      className="font-medium underline"
                      style={{ color: "var(--portal-accent)" }}
                    >
                      Reopen this ticket?
                    </button>
                  </p>
                </div>
              )}

              {!isResolved && !isClosed && (
                <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--portal-border)" }}>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{
                        backgroundColor: "var(--portal-bg)",
                        borderColor: "var(--portal-border)",
                        color: "var(--portal-text-primary)",
                      }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between">
                    <button
                      className="flex items-center gap-1 text-sm"
                      style={{ color: "var(--portal-text-muted)" }}
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Attach
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || isSending}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
                      style={{ backgroundColor: "var(--portal-accent)" }}
                    >
                      {isSending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details sidebar */}
          <div>
            <div
              className="rounded-lg border p-5"
              style={{
                backgroundColor: "var(--portal-surface)",
                borderColor: "var(--portal-border)",
              }}
            >
              <h2
                className="mb-4 text-sm font-semibold"
                style={{ color: "var(--portal-text-primary)" }}
              >
                Details
              </h2>
              <dl className="space-y-3">
                {[
                  {
                    label: "Status",
                    value: statusLabels[ticket.status],
                    color:
                      ticket.status === "resolved"
                        ? "var(--portal-success)"
                        : ticket.status === "in_progress" || ticket.status === "awaiting_reply"
                          ? "var(--portal-warning)"
                          : "var(--portal-text-primary)",
                  },
                  {
                    label: "Priority",
                    value: ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
                    color: priorityColors[ticket.priority],
                  },
                  {
                    label: "Location",
                    value: ticket.location_name,
                    color: "var(--portal-text-primary)",
                  },
                  {
                    label: "Reference",
                    value: ticket.id.replace("tkt_", "TKT-"),
                    color: "var(--portal-text-primary)",
                    mono: true,
                  },
                  {
                    label: "Submitted",
                    value: new Date(ticket.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                    color: "var(--portal-text-secondary)",
                  },
                  {
                    label: "Last update",
                    value: new Date(ticket.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }),
                    color: "var(--portal-text-secondary)",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <dt
                      className="text-xs font-medium"
                      style={{ color: "var(--portal-text-muted)" }}
                    >
                      {item.label}
                    </dt>
                    <dd
                      className={`mt-0.5 text-sm font-medium ${
                        "mono" in item && item.mono ? "font-mono" : ""
                      }`}
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Attachments */}
              {ticket.attachments.length > 0 && (
                <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--portal-border)" }}>
                  <h3
                    className="mb-2 text-xs font-medium"
                    style={{ color: "var(--portal-text-muted)" }}
                  >
                    Attachments ({ticket.attachments.length})
                  </h3>
                  <div className="space-y-2">
                    {ticket.attachments.map((att: PortalAttachment) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs"
                        style={{
                          borderColor: "var(--portal-border)",
                          color: "var(--portal-text-secondary)",
                        }}
                      >
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate">{att.name}</span>
                        <span style={{ color: "var(--portal-text-muted)" }}>
                          {att.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PortalFooter />
    </div>
  );
}
