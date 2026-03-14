"use client";

import Link from "next/link";
import type { Broadcast } from "@uniflo/mock-data";
import { BroadcastStatusChip } from "./BroadcastStatusChip";
import { BroadcastPriorityBadge } from "./BroadcastPriorityBadge";
import { CheckCircle2 } from "lucide-react";
import {
  TableRow,
  TableCell,
} from "@uniflo/ui";

interface BroadcastRowProps {
  broadcast: Broadcast;
  locale: string;
  getUserName: (id: string) => string;
}

export function BroadcastRow({ broadcast, locale, getUserName }: BroadcastRowProps) {
  const href =
    broadcast.status === "sent"
      ? `/${locale}/comms/${broadcast.id}/`
      : `/${locale}/comms/new/`;

  const sentDate = broadcast.sent_at
    ? new Date(broadcast.sent_at)
    : broadcast.scheduled_at
      ? new Date(broadcast.scheduled_at)
      : null;

  const audienceLabel =
    broadcast.audience.region_ids.length === 3
      ? "All"
      : broadcast.audience.region_ids.length > 0
        ? `${broadcast.audience.region_ids.length} region${broadcast.audience.region_ids.length > 1 ? "s" : ""}`
        : "--";

  return (
    <TableRow className="cursor-pointer">
      <TableCell className="text-xs text-[var(--text-muted)] font-mono">
        {broadcast.id.replace("bc_", "BC-")}
      </TableCell>
      <TableCell>
        <Link
          href={href}
          className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
        >
          {broadcast.title}
        </Link>
      </TableCell>
      <TableCell>
        <BroadcastStatusChip status={broadcast.status} />
      </TableCell>
      <TableCell>
        <BroadcastPriorityBadge priority={broadcast.priority} />
      </TableCell>
      <TableCell className="text-sm text-[var(--text-secondary)]">
        {audienceLabel}
        {broadcast.audience.total_recipients > 0 && (
          <span className="text-xs text-[var(--text-muted)]"> ({broadcast.audience.total_recipients})</span>
        )}
      </TableCell>
      <TableCell>
        {sentDate ? (
          <span
            className={`text-xs ${
              broadcast.status === "scheduled"
                ? "text-[var(--accent-blue)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            {sentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {broadcast.status === "scheduled" && " (sched)"}
          </span>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">--</span>
        )}
      </TableCell>
      <TableCell>
        {broadcast.stats ? (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-12 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${broadcast.stats.open_rate}%`,
                  backgroundColor:
                    broadcast.stats.open_rate >= 80
                      ? "var(--accent-green)"
                      : broadcast.stats.open_rate >= 60
                        ? "var(--accent-yellow, #F59E0B)"
                        : "var(--accent-red)",
                }}
              />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              {broadcast.stats.open_rate.toFixed(0)}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">--</span>
        )}
      </TableCell>
      <TableCell>
        {broadcast.acknowledgment_required && broadcast.stats ? (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-12 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent-green)]"
                style={{ width: `${broadcast.stats.ack_rate}%` }}
              />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              {broadcast.stats.ack_rate.toFixed(0)}%
            </span>
          </div>
        ) : (
          <span className="text-xs text-[var(--text-muted)]">--</span>
        )}
      </TableCell>
      <TableCell>
        {broadcast.acknowledgment_required ? (
          <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)]" />
        ) : (
          <span className="text-xs text-[var(--text-muted)]">--</span>
        )}
      </TableCell>
      <TableCell className="text-sm text-[var(--text-secondary)]">
        {getUserName(broadcast.created_by)}
      </TableCell>
    </TableRow>
  );
}
