"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { sops as allSops, users } from "@uniflo/mock-data";
import type { SOP } from "@uniflo/mock-data";
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
  Checkbox,
  KPICard,
} from "@uniflo/ui";
import { Plus, ArrowUpDown } from "lucide-react";
import { SOPStatusChip } from "@/components/sops/SOPStatusChip";
import { SOPCategoryBadge } from "@/components/sops/SOPCategoryBadge";
import { SOPBulkActionsBar } from "@/components/sops/SOPBulkActionsBar";
import { SOPFilterBar } from "@/components/sops/SOPFilterBar";
import { CreateSOPModal } from "@/components/sops/CreateSOPModal";

const NOW = new Date("2026-03-14T12:00:00Z");
const PER_PAGE = 10;

type SortKey = "title" | "category" | "status" | "version" | "updated_at";
type SortDir = "asc" | "desc";

export default function SOPsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const sops = allSops as SOP[];

  // KPI counts
  const publishedCount = useMemo(() => sops.filter(s => s.status === "published").length, [sops]);
  const inReviewCount = useMemo(() => sops.filter(s => s.status === "in_review").length, [sops]);
  const draftCount = useMemo(() => sops.filter(s => s.status === "draft").length, [sops]);
  const ackRate = useMemo(() => {
    const withAck = sops.filter(s => s.acknowledgment_required && s.acknowledgments.length > 0);
    if (withAck.length === 0) return 0;
    const totalAck = withAck.reduce((sum, s) => sum + s.acknowledgments.filter(a => a.acknowledged_at !== null).length, 0);
    const totalAssigned = withAck.reduce((sum, s) => sum + s.acknowledgments.length, 0);
    return totalAssigned > 0 ? Math.round((totalAck / totalAssigned) * 100) : 0;
  }, [sops]);

  const filtered = useMemo(() => {
    let result = [...sops];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(s => s.status === statusFilter);
    if (categoryFilter !== "all") result = result.filter(s => s.category === categoryFilter);
    if (locationFilter !== "all") result = result.filter(s => s.location_ids.includes(locationFilter));
    if (dateFilter !== "all") {
      const days = dateFilter === "7" ? 7 : 30;
      const cutoff = new Date(NOW.getTime() - days * 86400000);
      result = result.filter(s => new Date(s.updated_at) >= cutoff);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "version":
          cmp = parseFloat(a.version) - parseFloat(b.version);
          break;
        case "updated_at":
          cmp = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [sops, search, statusFilter, categoryFilter, locationFilter, dateFilter, sortKey, sortDir]);

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
      setSelected(new Set(pageData.map(s => s.id)));
    }
  }

  function applyKPIFilter(status: string) {
    setStatusFilter(status);
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
        title="SOPs"
        subtitle="Standard operating procedures for your organization"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New SOP
          </Button>
        }
        className="px-0 py-0 border-0"
      />

      {/* KPI Summary Bar */}
      <div className="grid grid-cols-4 gap-3">
        <button onClick={() => applyKPIFilter("published")} className="text-start">
          <KPICard title="Published" value={publishedCount} color="var(--accent-green)" />
        </button>
        <button onClick={() => applyKPIFilter("in_review")} className="text-start">
          <KPICard title="In Review" value={inReviewCount} color="var(--accent-amber)" />
        </button>
        <button onClick={() => applyKPIFilter("draft")} className="text-start">
          <KPICard title="Draft" value={draftCount} />
        </button>
        <button onClick={() => applyKPIFilter("all")} className="text-start">
          <KPICard title="Ack Rate" value={`${ackRate}%`} color="var(--accent-blue)" />
        </button>
      </div>

      {/* Filters */}
      <SOPFilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={v => { setStatusFilter(v); setPage(1); }}
        categoryFilter={categoryFilter}
        onCategoryChange={v => { setCategoryFilter(v); setPage(1); }}
        locationFilter={locationFilter}
        onLocationChange={v => { setLocationFilter(v); setPage(1); }}
        dateFilter={dateFilter}
        onDateChange={v => { setDateFilter(v); setPage(1); }}
      />

      <div className="text-xs text-[var(--text-muted)]">{filtered.length} SOP{filtered.length !== 1 ? "s" : ""} found</div>

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
            <TableHead><SortButton label="Category" field="category" /></TableHead>
            <TableHead><SortButton label="Status" field="status" /></TableHead>
            <TableHead><SortButton label="Version" field="version" /></TableHead>
            <TableHead>Locations</TableHead>
            <TableHead><SortButton label="Updated" field="updated_at" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map(sop => (
            <TableRow key={sop.id} className="cursor-pointer group">
              <TableCell onClick={e => e.stopPropagation()}>
                <Checkbox
                  checked={selected.has(sop.id)}
                  onCheckedChange={() => toggleSelect(sop.id)}
                />
              </TableCell>
              <TableCell className="text-xs text-[var(--text-muted)] font-mono">
                {sop.id.replace("sop_0", "")}
              </TableCell>
              <TableCell>
                <Link
                  href={`/${locale}/sops/${sop.id}/`}
                  className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                >
                  {sop.title}
                </Link>
              </TableCell>
              <TableCell>
                <SOPCategoryBadge category={sop.category} />
              </TableCell>
              <TableCell>
                <SOPStatusChip status={sop.status} />
              </TableCell>
              <TableCell className="text-sm text-[var(--text-secondary)]">v{sop.version}</TableCell>
              <TableCell className="text-sm text-[var(--text-secondary)]">
                {sop.location_ids.length} loc{sop.location_ids.length !== 1 ? "s" : ""}
              </TableCell>
              <TableCell className="text-xs text-[var(--text-secondary)]">
                {new Date(sop.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          Page {page} of {totalPages}
        </span>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <SOPBulkActionsBar
        selectedCount={selected.size}
        onPublish={() => {}}
        onArchive={() => {}}
        onAssignLocations={() => {}}
        onExport={() => {}}
        onClear={() => setSelected(new Set())}
      />

      <CreateSOPModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
