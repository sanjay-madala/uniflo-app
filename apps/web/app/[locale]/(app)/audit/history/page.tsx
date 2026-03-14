"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  audits as allAudits,
  auditTemplates,
  auditTrend,
  users,
} from "@uniflo/mock-data";
import type { Audit, AuditTemplate, AuditTrendPoint } from "@uniflo/mock-data";
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
  KPICard,
  Card,
} from "@uniflo/ui";
import { Download, ArrowLeft, ArrowUpDown } from "lucide-react";
import { AuditStatusChip } from "@/components/audit/AuditStatusChip";
import { AuditScoreBadge } from "@/components/audit/AuditScoreBadge";
import { AuditTrendChart } from "@/components/audit/AuditTrendChart";

const PER_PAGE = 10;

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

type SortKey = "title" | "score" | "result" | "date";
type SortDir = "asc" | "desc";

function getUserName(id: string): string {
  const u = users.find((u) => u.id === id);
  return u?.name ?? "Unknown";
}

function getAuditDate(audit: Audit): string {
  return audit.completed_at || audit.started_at || audit.scheduled_at || "";
}

export default function AuditHistoryPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const audits = (allAudits as Audit[]).filter(
    (a) => a.status === "completed" || a.status === "failed"
  );
  const templates = auditTemplates as AuditTemplate[];
  const trendData = auditTrend as AuditTrendPoint[];

  // KPI computations
  const kpis = useMemo(() => {
    const scores = audits.filter((a) => a.score !== null).map((a) => a.score as number);
    const totalAudits = audits.length;
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const passRate = audits.length > 0
      ? Math.round((audits.filter((a) => a.pass === true).length / audits.length) * 100)
      : 0;

    // 30-day trend
    const currentMonthScore = trendData.length > 0 ? trendData[trendData.length - 1].score : 0;
    const prevMonthScore = trendData.length > 1 ? trendData[trendData.length - 2].score : 0;
    const trend30d = currentMonthScore - prevMonthScore;

    return { totalAudits, avgScore, passRate, trend30d };
  }, [audits, trendData]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...audits];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (locationFilter !== "all") result = result.filter((a) => a.location_id === locationFilter);
    if (templateFilter !== "all") result = result.filter((a) => a.template_id === templateFilter);
    if (resultFilter !== "all") {
      if (resultFilter === "pass") result = result.filter((a) => a.pass === true);
      else result = result.filter((a) => a.pass === false);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "score":
          cmp = (a.score ?? -1) - (b.score ?? -1);
          break;
        case "result":
          cmp = (a.pass === b.pass ? 0 : a.pass ? 1 : -1);
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
  }, [audits, search, locationFilter, templateFilter, resultFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
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
        title="Audit History"
        subtitle="Review past audits and compliance trends"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Link href={`/${locale}/audit/`}>
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4" /> Back to Audits
              </Button>
            </Link>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPICard title="Total Audits" value={kpis.totalAudits} unit="completed" />
        <KPICard title="Avg Score" value={`${kpis.avgScore}%`} />
        <KPICard title="Pass Rate" value={`${kpis.passRate}%`} />
        <KPICard
          title="Trend (30d)"
          value={`${kpis.trend30d >= 0 ? "+" : ""}${kpis.trend30d}%`}
          trend={kpis.trend30d}
          trendLabel="vs last month"
          isPositive
        />
      </div>

      {/* Trend Chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Compliance Trend (6 months)
        </h3>
        <AuditTrendChart data={trendData} height={280} />
        <div className="mt-2 flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <div className="h-0.5 w-4 bg-[var(--accent-blue)]" /> Average Score
          </span>
          <span className="flex items-center gap-1">
            <div className="h-0.5 w-4 border-t border-dashed border-[var(--accent-yellow)]" /> Pass Threshold (85%)
          </span>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search audits..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
        <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {Object.entries(locationLabels).map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={templateFilter} onValueChange={(v) => { setTemplateFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Templates</SelectItem>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={resultFilter} onValueChange={(v) => { setResultFilter(v); setPage(1); }}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Result" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="pass">Pass</SelectItem>
            <SelectItem value="fail">Fail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-[var(--text-muted)]">
        {filtered.length} audit{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* History Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead><SortButton label="Title" field="title" /></TableHead>
            <TableHead>Location</TableHead>
            <TableHead><SortButton label="Score" field="score" /></TableHead>
            <TableHead><SortButton label="Result" field="result" /></TableHead>
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
                    href={`/${locale}/audit/${audit.id}/results/`}
                    className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                  >
                    {audit.title}
                  </Link>
                </TableCell>
                <TableCell className="text-sm">
                  {locationLabels[audit.location_id] ?? audit.location_id}
                </TableCell>
                <TableCell>
                  <AuditScoreBadge score={audit.score} pass={audit.pass} />
                </TableCell>
                <TableCell>
                  <AuditStatusChip status={audit.status} />
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
    </div>
  );
}
