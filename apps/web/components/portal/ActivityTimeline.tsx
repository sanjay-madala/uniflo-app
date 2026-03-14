"use client";

import type { PortalTimelineEntry, PortalTimelineEntryType, PortalAttachment } from "@uniflo/mock-data";
import {
  MessageSquare,
  ArrowRight,
  Paperclip,
  CheckCircle2,
  RotateCcw,
  XCircle,
  Send,
} from "lucide-react";

const entryConfig: Record<
  PortalTimelineEntryType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  submitted: { icon: Send, color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  status_change: { icon: ArrowRight, color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  agent_reply: { icon: MessageSquare, color: "#059669", bg: "rgba(5,150,105,0.1)" },
  customer_reply: { icon: MessageSquare, color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  attachment_added: { icon: Paperclip, color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
  resolved: { icon: CheckCircle2, color: "#059669", bg: "rgba(5,150,105,0.1)" },
  reopened: { icon: RotateCcw, color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  closed: { icon: XCircle, color: "#6B7280", bg: "rgba(107,114,128,0.1)" },
};

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

interface ActivityTimelineProps {
  entries: PortalTimelineEntry[];
}

export function ActivityTimeline({ entries }: ActivityTimelineProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="space-y-0">
      {sorted.map((entry, i) => {
        const config = entryConfig[entry.type];
        const Icon = config.icon;

        return (
          <div key={entry.id} className="flex gap-3 pb-6">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: config.bg }}
              >
                <Icon className="h-4 w-4" style={{ color: config.color }} />
              </div>
              {i < sorted.length - 1 && (
                <div
                  className="mt-1 w-px flex-1"
                  style={{ backgroundColor: "var(--portal-border)" }}
                />
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-medium"
                  style={{
                    color:
                      entry.actor === "customer"
                        ? "var(--portal-accent)"
                        : "var(--portal-text-primary)",
                  }}
                >
                  {entry.actor_name}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--portal-text-muted)" }}
                >
                  {formatTimestamp(entry.created_at)}
                </span>
              </div>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: "var(--portal-text-secondary)" }}
              >
                {entry.content}
              </p>
              {entry.attachments && entry.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.attachments.map((att: PortalAttachment) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                      style={{
                        borderColor: "var(--portal-border)",
                        color: "var(--portal-text-secondary)",
                      }}
                    >
                      <Paperclip className="h-3 w-3" />
                      {att.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
