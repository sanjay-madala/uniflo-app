"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tickets as allTickets, users } from "@uniflo/mock-data";
import type { Ticket } from "@uniflo/mock-data";
import {
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
} from "@uniflo/ui";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { StatusChip } from "@/components/tickets/StatusChip";

const CURRENT_USER = "usr_002";
const NOW = new Date("2026-03-13T12:00:00Z");

export default function MyTicketsPage() {
  const { locale } = useParams<{ locale: string }>();
  const tickets = allTickets as Ticket[];

  const assigned = useMemo(() => tickets.filter(t => t.assignee_id === CURRENT_USER), [tickets]);
  const created = useMemo(() => tickets.filter(t => t.reporter_id === CURRENT_USER), [tickets]);
  const watching = useMemo(() => tickets.filter(t => t.watchers?.includes(CURRENT_USER)), [tickets]);

  const openCount = assigned.filter(t => t.status === "open" || t.status === "in_progress").length;
  const slaBreaches = assigned.filter(
    t => t.sla_breach_at && new Date(t.sla_breach_at) < NOW && t.status !== "closed" && t.status !== "resolved"
  ).length;
  const resolvedThisWeek = assigned.filter(t => {
    if (!t.resolved_at) return false;
    const resolved = new Date(t.resolved_at);
    const weekAgo = new Date(NOW.getTime() - 7 * 86400000);
    return resolved >= weekAgo;
  }).length;

  function TicketTable({ data }: { data: Ticket[] }) {
    if (data.length === 0) {
      return <p className="py-8 text-center text-sm text-[var(--text-muted)]">No tickets found</p>;
    }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(t => (
            <TableRow key={t.id}>
              <TableCell>
                <Link
                  href={`/${locale}/tickets/${t.id}/`}
                  className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                >
                  {t.title}
                </Link>
              </TableCell>
              <TableCell><PriorityBadge priority={t.priority} /></TableCell>
              <TableCell><StatusChip status={t.status} /></TableCell>
              <TableCell className="text-xs text-[var(--text-secondary)]">
                {new Date(t.updated_at ?? t.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="My Tickets"
        subtitle="Your personal ticket dashboard"
        className="px-0 py-0 border-0"
      />

      {/* KPI Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Open Tickets</p>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">{openCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">SLA Breaches</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: slaBreaches > 0 ? "var(--accent-red)" : "var(--text-primary)" }}>{slaBreaches}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Resolved This Week</p>
          <p className="mt-1 text-2xl font-bold text-[var(--accent-green)]">{resolvedThisWeek}</p>
        </Card>
      </div>

      <Tabs defaultValue="assigned">
        <TabsList>
          <TabsTrigger value="assigned">
            Assigned to Me <Badge className="ms-2">{assigned.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="created">
            Created by Me <Badge className="ms-2">{created.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="watching">
            Watching <Badge className="ms-2">{watching.length}</Badge>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="assigned"><TicketTable data={assigned} /></TabsContent>
        <TabsContent value="created"><TicketTable data={created} /></TabsContent>
        <TabsContent value="watching"><TicketTable data={watching} /></TabsContent>
      </Tabs>
    </div>
  );
}
