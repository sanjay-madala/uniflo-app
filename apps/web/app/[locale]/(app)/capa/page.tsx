"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCAPAsData } from "@/lib/data/useCAPAsData";
import type { CAPA } from "@uniflo/mock-data";
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
} from "@uniflo/ui";
import { Plus, ArrowUpDown, UserPlus, XCircle, AlertTriangle, Download, X } from "lucide-react";
import { CAPASeverityBadge } from "@/components/capa/CAPASeverityBadge";
import { CAPAStatusChip } from "@/components/capa/CAPAStatusChip";
import { CAPASourceBadge } from "@/components/capa/CAPASourceBadge";
import { CAPAKPIBar } from "@/components/capa/CAPAKPIBar";
import { CAPAStatusTimeline } from "@/components/capa/CAPAStatusTimeline";
import { CAPACard } from "@/components/capa/CAPACard";

const NOW = new Date("2026-03-14T12:00:00Z");
const PER_PAGE = 10;

const locationLabels: Record<string, string> = {
  loc_001: "Downtown",
  loc_002: "Airport",
  loc_003: "Resort",
};

type SortKey = "title" | "severity" | "status" | "due_date" | "created_at";
type SortDir = "asc" | "desc";

const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const statusOrder: Record<string, number> = { open: 0, in_progress: 1, verified: 2, closed: 3 };

function isOverdue(capa: CAPA): boolean {
  return new Date(capa.due_date) < NOW && capa.status !== "closed";
}

export default function CAPAListPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data: allCapas, users, isLoading, error } = useCAPAsData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const capas = allCapas as CAPA[];

  const getUserName = useCallback((id: string): string => {
    const u = users.find(u => u.id === id);
    return u?.name ?? "";
  }, [users]);

  const kpiData = useMemo(() => {
    const total = capas.length;
    const open = capas.filter(c => c.status === "open").length;
    const overdue = capas.filter(c => isOverdue(c)).length;
    const closed = capas.filter(c => c.status === "closed").length;
    const closureRate = total > 0 ? (closed / total) * 100 : 0;
    return { total, open, overdue, closureRate };
  }, [capas]);

  const filtered = useMemo(() => {
    let result = [...capas];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(c => c.status === statusFilter);
    if (severityFilter !== "all") result = result.filter(c => c.severity === severityFilter);
    if (sourceFilter !== "all") result = result.filter(c => c.source === sourceFilter);
    if (ownerFilter !== "all") result = result.filter(c => c.owner_id === ownerFilter);
    if (dateFilter !== "all") {
      const days = dateFilter === "7" ? 7 : 30;
      const cutoff = new Date(NOW.getTime() - days * 86400000);
      result = result.filter(c => new Date(c.created_at) >= cutoff);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "severity":
          cmp = (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
          break;
        case "status":
          cmp = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
          break;
        case "due_date":
          cmp = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [capas, search, statusFilter, severityFilter, sourceFilter, ownerFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-4 w-72 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load CAPAs: {error.message}</p>
        </div>
      </div>
    );
  }

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
      setSelected(new Set(pageData.map(c => c.id)));
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
        title="CAPA"
        subtitle="Corrective and preventive actions to drive continuous improvement"
        actions={
          <Link href={`/${locale}/capa/create/`}>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New CAPA
            </Button>
          </Link>
        }
        className="px-0 py-0 border-0"
      />

      <CAPAKPIBar
        total={kpiData.total}
        open={kpiData.open}
        overdue={kpiData.overdue}
        closureRate={kpiData.closureRate}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search CAPAs..."
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
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={v => { setSeverityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={v => { setSourceFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Source" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="audit">Audit</SelectItem>
            <SelectItem value="ticket">Ticket</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={v => { setOwnerFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Owner" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
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

      <div className="text-xs text-[var(--text-muted)]">{filtered.length} CAPA{filtered.length !== 1 ? "s" : ""} found</div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={pageData.length > 0 && selected.size === pageData.length}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="w-20">ID</TableHead>
              <TableHead><SortButton label="Title" field="title" /></TableHead>
              <TableHead><SortButton label="Severity" field="severity" /></TableHead>
              <TableHead><SortButton label="Status" field="status" /></TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead><SortButton label="Due Date" field="due_date" /></TableHead>
              <TableHead className="w-20">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map(capa => {
              const overdue = isOverdue(capa);
              return (
                <TableRow
                  key={capa.id}
                  className={`cursor-pointer ${overdue ? "border-l-2 border-l-[var(--accent-red)]" : ""}`}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(capa.id)}
                      onCheckedChange={() => toggleSelect(capa.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-muted)] font-mono">
                    {capa.id.replace("capa_", "CAPA-")}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/${locale}/capa/${capa.id}/`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                    >
                      {capa.title}
                    </Link>
                  </TableCell>
                  <TableCell><CAPASeverityBadge severity={capa.severity} /></TableCell>
                  <TableCell><CAPAStatusChip status={capa.status} /></TableCell>
                  <TableCell><CAPASourceBadge source={capa.source} /></TableCell>
                  <TableCell>
                    <span className="text-sm">{getUserName(capa.owner_id)}</span>
                  </TableCell>
                  <TableCell className="text-sm hidden lg:table-cell">
                    {locationLabels[capa.location_id] ?? capa.location_id}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs ${overdue ? "font-medium text-[var(--accent-red)]" : "text-[var(--text-secondary)]"}`}>
                      {new Date(capa.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {overdue && " (overdue)"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CAPAStatusTimeline status={capa.status} variant="compact" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2">
        {pageData.map(capa => (
          <CAPACard
            key={capa.id}
            capa={capa}
            users={users}
            locale={locale}
            isOverdue={isOverdue(capa)}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          Page {page} of {totalPages}
        </span>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-3 shadow-lg animate-in slide-in-from-bottom duration-200">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {selected.size} CAPA{selected.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => {}}>
                <UserPlus className="h-3.5 w-3.5" />
                Assign
              </Button>
              <Button variant="secondary" size="sm" onClick={() => {}}>
                <XCircle className="h-3.5 w-3.5" />
                Change Status
              </Button>
              <Button variant="secondary" size="sm" onClick={() => {}}>
                <AlertTriangle className="h-3.5 w-3.5" />
                Change Severity
              </Button>
              <Button variant="secondary" size="sm" onClick={() => {}}>
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
