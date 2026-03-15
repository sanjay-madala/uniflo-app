"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTicketsData } from "@/lib/data/useTicketsData";
import type { Ticket, TicketStatus, User } from "@uniflo/mock-data";
import { KanbanBoard, type KanbanColumn, Button, PageHeader } from "@uniflo/ui";
import { List } from "lucide-react";

const statusColumns: { id: TicketStatus; title: string; color: string }[] = [
  { id: "open", title: "Open", color: "var(--accent-blue)" },
  { id: "in_progress", title: "In Progress", color: "var(--accent-purple)" },
  { id: "resolved", title: "Resolved", color: "var(--accent-green)" },
  { id: "closed", title: "Closed", color: "var(--text-muted)" },
];

const categoryLabels: Record<string, string> = {
  fb: "F&B",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  compliance: "Compliance",
  guest_relations: "Guest Relations",
};

const priorityLabels: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function getUserName(id: string | null, usersList: User[]): string {
  if (!id) return "Unassigned";
  return usersList.find(u => u.id === id)?.name ?? "Unknown";
}

export default function TicketsBoardPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data: ticketsData, users, isLoading, error } = useTicketsData();
  const tickets = ticketsData as Ticket[];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load tickets: {error.message}</p>
        </div>
      </div>
    );
  }

  const [ticketState, setTicketState] = useState<Record<string, TicketStatus>>(() => {
    const map: Record<string, TicketStatus> = {};
    tickets.forEach(t => { map[t.id] = t.status; });
    return map;
  });

  const columns: KanbanColumn[] = useMemo(() => {
    return statusColumns.map(col => ({
      id: col.id,
      title: col.title,
      color: col.color,
      cards: tickets
        .filter(t => ticketState[t.id] === col.id)
        .map(t => ({
          id: t.id,
          title: t.title,
          description: `${priorityLabels[t.priority] ?? t.priority} · ${getUserName(t.assignee_id, users)}`,
          labels: [
            categoryLabels[t.category ?? ""] ?? t.category,
            priorityLabels[t.priority] ?? t.priority,
          ].filter(Boolean),
          assignee: getUserName(t.assignee_id, users),
        })),
    }));
  }, [tickets, ticketState]);

  function handleCardMove(cardId: string, _fromColumnId: string, toColumnId: string) {
    setTicketState(prev => ({ ...prev, [cardId]: toColumnId as TicketStatus }));
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Tickets — Board View"
        subtitle="Drag and drop tickets between columns to update status"
        actions={
          <Link href={`/${locale}/tickets/`}>
            <Button variant="secondary" size="sm"><List className="h-4 w-4" /> Table View</Button>
          </Link>
        }
        className="px-0 py-0 border-0"
      />
      <KanbanBoard columns={columns} onCardMove={handleCardMove} />
    </div>
  );
}
