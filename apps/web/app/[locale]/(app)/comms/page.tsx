"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { broadcasts as allBroadcasts, users } from "@uniflo/mock-data";
import type { Broadcast, BroadcastStatus, BroadcastPriority } from "@uniflo/mock-data";
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
} from "@uniflo/ui";
import { Plus, FileText, ArrowUpDown, Megaphone } from "lucide-react";
import { BroadcastKPIBar } from "@/components/broadcasts/BroadcastKPIBar";
import { BroadcastFilters } from "@/components/broadcasts/BroadcastFilters";
import { BroadcastRow } from "@/components/broadcasts/BroadcastRow";
import { StaffAcknowledgmentBanner } from "@/components/broadcasts/StaffAcknowledgmentBanner";

const NOW = new Date("2026-03-14T12:00:00Z");
const PER_PAGE = 10;

type SortKey = "subject" | "status" | "priority" | "sent_at" | "open_rate" | "ack_rate";
type SortDir = "asc" | "desc";

const priorityOrder: Record<string, number> = { critical: 0, urgent: 1, normal: 2 };
const statusOrder: Record<string, number> = { failed: 0, draft: 1, scheduled: 2, sent: 3 };

function getUserName(id: string): string {
  const u = users.find((u) => u.id === id);
  return u?.name ?? id;
}

export default function BroadcastsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("sent_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const broadcasts = allBroadcasts as Broadcast[];

  // Mock: broadcasts requiring acknowledgment for current user
  const pendingAckBroadcasts = useMemo(() => {
    return broadcasts.filter(
      (b) =>
        b.status === "sent" &&
        b.acknowledgment_required &&
        b.stats &&
        b.stats.ack_rate < 100
    ).slice(0, 2);
  }, [broadcasts]);

  const filtered = useMemo(() => {
    let result = [...broadcasts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter((b) => b.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter((b) => b.priority === priorityFilter);
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter, 10);
      const cutoff = new Date(NOW.getTime() - days * 86400000);
      result = result.filter((b) => new Date(b.created_at) >= cutoff);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "subject":
          cmp = a.title.localeCompare(b.title);
          break;
        case "status":
          cmp = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
          break;
        case "priority":
          cmp = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
          break;
        case "sent_at": {
          const aDate = a.sent_at ?? a.scheduled_at ?? a.created_at;
          const bDate = b.sent_at ?? b.scheduled_at ?? b.created_at;
          cmp = new Date(aDate).getTime() - new Date(bDate).getTime();
          break;
        }
        case "open_rate":
          cmp = (a.stats?.open_rate ?? -1) - (b.stats?.open_rate ?? -1);
          break;
        case "ack_rate":
          cmp = (a.stats?.ack_rate ?? -1) - (b.stats?.ack_rate ?? -1);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [broadcasts, search, statusFilter, priorityFilter, dateFilter, sortKey, sortDir]);

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
      <StaffAcknowledgmentBanner pendingBroadcasts={pendingAckBroadcasts} />

      <PageHeader
        title="Broadcasts"
        subtitle="Communicate with your teams across all locations"
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/comms/templates/`}>
              <Button variant="secondary" size="sm">
                <FileText className="h-4 w-4" />
                Templates
              </Button>
            </Link>
            <Link href={`/${locale}/comms/new/`}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                New Broadcast
              </Button>
            </Link>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      <BroadcastKPIBar broadcasts={broadcasts} />

      <BroadcastFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        priorityFilter={priorityFilter}
        onPriorityChange={(v) => { setPriorityFilter(v); setPage(1); }}
        dateFilter={dateFilter}
        onDateChange={(v) => { setDateFilter(v); setPage(1); }}
      />

      <div className="text-xs text-[var(--text-muted)]">
        {filtered.length} broadcast{filtered.length !== 1 ? "s" : ""} found
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="rounded-2xl bg-[var(--bg-tertiary)] p-6">
            <Megaphone className="h-12 w-12 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">No broadcasts yet</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md text-center">
            Send your first broadcast to communicate with your team
          </p>
          <Link href={`/${locale}/comms/new/`}>
            <Button>
              <Plus className="h-4 w-4" />
              New Broadcast
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead><SortButton label="Subject" field="subject" /></TableHead>
                <TableHead><SortButton label="Status" field="status" /></TableHead>
                <TableHead><SortButton label="Priority" field="priority" /></TableHead>
                <TableHead>Audience</TableHead>
                <TableHead><SortButton label="Sent" field="sent_at" /></TableHead>
                <TableHead><SortButton label="Open Rate" field="open_rate" /></TableHead>
                <TableHead><SortButton label="Ack Rate" field="ack_rate" /></TableHead>
                <TableHead>Ack Req</TableHead>
                <TableHead>Created By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.map((broadcast) => (
                <BroadcastRow
                  key={broadcast.id}
                  broadcast={broadcast}
                  locale={locale}
                  getUserName={getUserName}
                />
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              Page {page} of {totalPages}
            </span>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
