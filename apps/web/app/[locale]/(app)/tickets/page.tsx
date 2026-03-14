"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tickets as allTickets, users } from "@uniflo/mock-data";
import type { Ticket, TicketStatus, TicketPriority } from "@uniflo/mock-data";
import {
  PageHeader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Pagination,
  Checkbox,
  Badge,
} from "@uniflo/ui";
import { Plus, LayoutGrid, List, ArrowUpDown } from "lucide-react";
import { PriorityBadge } from "@/components/tickets/PriorityBadge";
import { StatusChip } from "@/components/tickets/StatusChip";
import { SLABar } from "@/components/tickets/SLABar";
import { BulkActionsBar } from "@/components/tickets/BulkActionsBar";
import { CreateTicketModal } from "@/components/tickets/CreateTicketModal";

const NOW = new Date("2026-03-13T12:00:00Z");
const PER_PAGE = 10;

const locationLabels: Record<string, string> = {
  loc_001: "Downtown",
  loc_002: "Airport",
  loc_003: "Resort",
};

const categoryLabels: Record<string, string> = {
  fb: "F&B",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  compliance: "Compliance",
  guest_relations: "Guest Relations",
};

type SortKey = "title" | "priority" | "status" | "assignee" | "created_at";
type SortDir = "asc" | "desc";

const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function getUserName(id: string | null): string {
  if (!id) return "";
  const u = users.find(u => u.id === id);
  return u?.name ?? "";
}

function formatSLA(ticket: Ticket): { text: string; breached: boolean } {
  if (!ticket.sla_breach_at) return { text: "—", breached: false };
  const breach = new Date(ticket.sla_breach_at);
  const diffMs = breach.getTime() - NOW.getTime();
  if (diffMs < 0) {
    const ago = Math.abs(diffMs);
    const hours = Math.floor(ago / 3600000);
    const mins = Math.floor((ago % 3600000) / 60000);
    return { text: `Breached ${hours}h ${mins}m ago`, breached: true };
  }
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return { text: `${hours}h ${mins}m`, breached: false };
}

export default function TicketsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const tickets = allTickets as Ticket[];

  const breachedCount = useMemo(
    () => tickets.filter(t => t.sla_breach_at && new Date(t.sla_breach_at) < NOW && t.status !== "closed" && t.status !== "resolved").length,
    [tickets]
  );

  const filtered = useMemo(() => {
    let result = [...tickets];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter(t => t.priority === priorityFilter);
    if (assigneeFilter !== "all") {
      result = assigneeFilter === "unassigned"
        ? result.filter(t => !t.assignee_id)
        : result.filter(t => t.assignee_id === assigneeFilter);
    }
    if (dateFilter !== "all") {
      const days = dateFilter === "7" ? 7 : 30;
      const cutoff = new Date(NOW.getTime() - days * 86400000);
      result = result.filter(t => new Date(t.created_at) >= cutoff);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "priority":
          cmp = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "assignee":
          cmp = getUserName(a.assignee_id).localeCompare(getUserName(b.assignee_id));
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tickets, search, statusFilter, priorityFilter, assigneeFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === pageData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageData.map(t => t.id)));
    }
  }

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
      onClick={() => toggleSort(field)}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Tickets"
        subtitle="Track and resolve issues across your organization"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/tickets/board/`}>
              <Button variant="secondary" size="sm"><LayoutGrid className="h-4 w-4" /> Board</Button>
            </Link>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New Ticket
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      <SLABar totalTickets={tickets.length} breachedCount={breachedCount} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={v => { setAssigneeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {users.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={v => { setDateFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-[var(--text-muted)]">{filtered.length} ticket{filtered.length !== 1 ? "s" : ""} found</div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={pageData.length > 0 && selected.size === pageData.length}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead className="w-16">#</TableHead>
            <TableHead><SortButton label="Title" field="title" /></TableHead>
            <TableHead>Category</TableHead>
            <TableHead><SortButton label="Priority" field="priority" /></TableHead>
            <TableHead><SortButton label="Status" field="status" /></TableHead>
            <TableHead><SortButton label="Assignee" field="assignee" /></TableHead>
            <TableHead>Location</TableHead>
            <TableHead><SortButton label="Created" field="created_at" /></TableHead>
            <TableHead>SLA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map(ticket => {
            const sla = formatSLA(ticket);
            return (
              <TableRow key={ticket.id} className="cursor-pointer">
                <TableCell onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(ticket.id)}
                    onCheckedChange={() => toggleSelect(ticket.id)}
                  />
                </TableCell>
                <TableCell className="text-xs text-[var(--text-muted)] font-mono">
                  {ticket.id.replace("tkt_", "")}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/${locale}/tickets/${ticket.id}/`}
                    className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                  >
                    {ticket.title}
                  </Link>
                </TableCell>
                <TableCell>
                  {ticket.category && (
                    <Badge>{categoryLabels[ticket.category] ?? ticket.category}</Badge>
                  )}
                </TableCell>
                <TableCell><PriorityBadge priority={ticket.priority} /></TableCell>
                <TableCell><StatusChip status={ticket.status} /></TableCell>
                <TableCell>
                  <span className={ticket.assignee_id ? "text-sm" : "text-sm text-[var(--text-muted)]"}>
                    {getUserName(ticket.assignee_id) || "Unassigned"}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{locationLabels[ticket.location_id] ?? ticket.location_id}</TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">
                  {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </TableCell>
                <TableCell>
                  <span className={sla.breached ? "text-xs font-medium text-[var(--accent-red)]" : "text-xs text-[var(--text-secondary)]"}>
                    {sla.text}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          Page {page} of {totalPages}
        </span>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <BulkActionsBar
        selectedCount={selected.size}
        onAssign={() => {}}
        onClose={() => {}}
        onTag={() => {}}
        onExport={() => {}}
        onClear={() => setSelected(new Set())}
      />

      <CreateTicketModal open={createOpen} onOpenChange={setCreateOpen} users={users} />
    </div>
  );
}
