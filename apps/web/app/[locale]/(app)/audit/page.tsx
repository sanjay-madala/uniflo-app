"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuditsData } from "@/lib/data/useAuditsData";
import type { Audit, AuditTemplate } from "@uniflo/mock-data";
import {
  PageHeader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Pagination,
  KPICard,
  Drawer,
  Card,
} from "@uniflo/ui";
import { Plus, Calendar, List, ArrowUpDown } from "lucide-react";
import { AuditStatusChip } from "@/components/audit/AuditStatusChip";
import { AuditScoreBadge } from "@/components/audit/AuditScoreBadge";
import { AuditComplianceBar } from "@/components/audit/AuditComplianceBar";
import { AuditFilterBar } from "@/components/audit/AuditFilterBar";
import { AuditCalendarView } from "@/components/audit/AuditCalendarView";

const NOW = new Date("2026-03-14T12:00:00Z");
const PER_PAGE = 10;

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

type SortKey = "title" | "status" | "score" | "date";
type SortDir = "asc" | "desc";

const statusOrder: Record<string, number> = {
  in_progress: 0,
  scheduled: 1,
  failed: 2,
  completed: 3,
};

function getAuditDate(audit: Audit): string {
  return audit.completed_at || audit.started_at || audit.scheduled_at || "";
}

export default function AuditPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data: allAudits, templates: allTemplates, users, isLoading, error } = useAuditsData();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 2));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const audits = allAudits as Audit[];
  const templates = allTemplates as AuditTemplate[];

  const getUserName = useCallback((id: string): string => {
    const u = users.find((u) => u.id === id);
    return u?.name ?? "Unknown";
  }, [users]);

  // KPI computations
  const kpis = useMemo(() => {
    const completed = audits.filter((a) => a.status === "completed" || a.status === "failed");
    const scheduled = audits.filter((a) => a.status === "scheduled").length;
    const inProgress = audits.filter((a) => a.status === "in_progress").length;
    const scores = completed.filter((a) => a.score !== null).map((a) => a.score as number);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const passRate = completed.length > 0
      ? Math.round((completed.filter((a) => a.pass === true).length / completed.length) * 100)
      : 0;

    return { scheduled, inProgress, avgScore, passRate };
  }, [audits]);

  const failedCount = useMemo(
    () => audits.filter((a) => a.status === "failed").length,
    [audits]
  );

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...audits];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((a) => a.status === statusFilter);
    if (locationFilter !== "all") result = result.filter((a) => a.location_id === locationFilter);
    if (templateFilter !== "all") result = result.filter((a) => a.template_id === templateFilter);
    if (dateFilter !== "all") {
      const days = dateFilter === "7" ? 7 : 30;
      const cutoff = new Date(NOW.getTime() - days * 86400000);
      result = result.filter((a) => {
        const d = getAuditDate(a);
        return d ? new Date(d) >= cutoff : false;
      });
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "status":
          cmp = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
          break;
        case "score":
          cmp = (a.score ?? -1) - (b.score ?? -1);
          break;
        case "date": {
          const da = getAuditDate(a);
          const db = getAuditDate(b);
          cmp = (da ? new Date(da).getTime() : 0) - (db ? new Date(db).getTime() : 0);
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [audits, search, statusFilter, locationFilter, templateFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-4 w-72 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-4 gap-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
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
          <p className="text-sm text-[var(--accent-red)]">Failed to load audits: {error.message}</p>
        </div>
      </div>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleKpiClick(status: string) {
    setStatusFilter(statusFilter === status ? "all" : status);
    setPage(1);
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
        title="Audits"
        subtitle="Schedule, conduct, and review compliance audits"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={view === "calendar" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setView("calendar")}
            >
              <Calendar className="h-4 w-4" /> Calendar
            </Button>
            <Button
              variant={view === "list" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" /> List
            </Button>
            <Button size="sm" onClick={() => setTemplateSelectorOpen(true)}>
              <Plus className="h-4 w-4" /> New Audit
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button onClick={() => handleKpiClick("scheduled")} className="text-start">
          <KPICard title="Scheduled" value={kpis.scheduled} />
        </button>
        <button onClick={() => handleKpiClick("in_progress")} className="text-start">
          <KPICard title="In Progress" value={kpis.inProgress} />
        </button>
        <KPICard title="Avg Score" value={`${kpis.avgScore}%`} />
        <KPICard title="Pass Rate" value={`${kpis.passRate}%`} />
      </div>

      <AuditComplianceBar
        avgScore={kpis.avgScore}
        totalAudits={audits.length}
        failedCount={failedCount}
      />

      {/* Filters */}
      <AuditFilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        locationFilter={locationFilter}
        onLocationChange={(v) => { setLocationFilter(v); setPage(1); }}
        templateFilter={templateFilter}
        onTemplateChange={(v) => { setTemplateFilter(v); setPage(1); }}
        dateFilter={dateFilter}
        onDateChange={(v) => { setDateFilter(v); setPage(1); }}
        templates={templates}
      />

      <div className="text-xs text-[var(--text-muted)]">
        {filtered.length} audit{filtered.length !== 1 ? "s" : ""} found
      </div>

      {view === "list" ? (
        <>
          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead><SortButton label="Title" field="title" /></TableHead>
                <TableHead>Location</TableHead>
                <TableHead><SortButton label="Status" field="status" /></TableHead>
                <TableHead><SortButton label="Score" field="score" /></TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead><SortButton label="Date" field="date" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((audit) => {
                const dateStr = getAuditDate(audit);
                return (
                  <TableRow key={audit.id} className="cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors">
                    <TableCell className="text-xs text-[var(--text-muted)] font-mono">
                      {audit.id.replace("aud_", "")}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/${locale}/audit/${audit.id}/`}
                        className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                      >
                        {audit.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      {locationLabels[audit.location_id] ?? audit.location_id}
                    </TableCell>
                    <TableCell>
                      <AuditStatusChip status={audit.status} />
                    </TableCell>
                    <TableCell>
                      <AuditScoreBadge score={audit.score} pass={audit.pass} />
                    </TableCell>
                    <TableCell className="text-sm text-[var(--text-secondary)]">
                      {getUserName(audit.auditor_id)}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {dateStr
                        ? new Date(dateStr).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "\u2014"}
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
        </>
      ) : (
        <AuditCalendarView
          audits={audits}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
        />
      )}

      {/* Template Selector Drawer */}
      <Drawer
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
        title="Select Audit Template"
        description="Choose a template to start a new audit"
        width="w-[420px]"
      >
        <div className="space-y-3">
          {templates.map((tmpl) => (
            <Card key={tmpl.id} className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
              <h4 className="text-sm font-medium text-[var(--text-primary)]">{tmpl.title}</h4>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{tmpl.description}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span>{tmpl.total_items} items</span>
                <span>{tmpl.sections.length} sections</span>
                <span>Pass: {tmpl.pass_threshold}%</span>
              </div>
            </Card>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
