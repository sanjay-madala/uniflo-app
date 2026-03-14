"use client";

import Link from "next/link";
import { Badge } from "@uniflo/ui";
import type { Ticket, User } from "@uniflo/mock-data";
import { PriorityBadge } from "./PriorityBadge";
import { StatusChip } from "./StatusChip";

const categoryLabels: Record<string, string> = {
  fb: "F&B",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  compliance: "Compliance",
  guest_relations: "Guest Relations",
};

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date("2026-03-13T12:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface TicketCardProps {
  ticket: Ticket;
  users: User[];
  locale: string;
}

export function TicketCard({ ticket, users, locale }: TicketCardProps) {
  const assignee = users.find(u => u.id === ticket.assignee_id);

  return (
    <Link
      href={`/${locale}/tickets/${ticket.id}/`}
      className="block rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 hover:border-[var(--border-strong)] transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">{ticket.title}</p>
        {assignee && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[10px] font-medium text-[var(--accent-blue)]">
            {getInitials(assignee.name)}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={ticket.priority} />
        <StatusChip status={ticket.status} />
        {ticket.category && (
          <Badge>{categoryLabels[ticket.category] ?? ticket.category}</Badge>
        )}
      </div>
      <p className="mt-2 text-xs text-[var(--text-muted)]">{timeAgo(ticket.created_at)}</p>
    </Link>
  );
}
