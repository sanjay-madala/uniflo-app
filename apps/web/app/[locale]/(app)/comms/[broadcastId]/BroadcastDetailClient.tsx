"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useBroadcastData } from "@/lib/data/useBroadcastsData";
import type {
  Broadcast,
  ReadReceipt,
  LocationReceiptSummary,
} from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Badge,
  Pagination,
} from "@uniflo/ui";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { BroadcastStatusChip } from "@/components/broadcasts/BroadcastStatusChip";
import { BroadcastPriorityBadge } from "@/components/broadcasts/BroadcastPriorityBadge";
import { ReadReceiptProgressBar } from "@/components/broadcasts/ReadReceiptProgressBar";
import { ReadReceiptRow } from "@/components/broadcasts/ReadReceiptRow";
import { ExportReceiptsButton } from "@/components/broadcasts/ExportReceiptsButton";

type SortKey = "location" | "region" | "staff" | "delivered" | "read" | "acknowledged" | "compliance";
type SortDir = "asc" | "desc";

const PER_PAGE = 10;

export default function BroadcastDetailClient() {
  const params = useParams<{ locale: string; broadcastId: string }>();
  const { locale, broadcastId } = params;

  const {
    broadcast,
    readReceipts: allReadReceipts,
    locationSummaries: allLocationSummaries,
    users,
  } = useBroadcastData(broadcastId);

  function getUserName(id: string): string {
    const u = users.find((u) => u.id === id);
    return u?.name ?? id;
  }

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [complianceFilter, setComplianceFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("compliance");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  // Get receipts for this broadcast
  const receipts = allReadReceipts;

  const locationSummaries = allLocationSummaries;

  // Group receipts by location
  const receiptsByLocation = useMemo(() => {
    const map: Record<string, ReadReceipt[]> = {};
    for (const r of receipts) {
      if (!map[r.location_id]) map[r.location_id] = [];
      map[r.location_id].push(r);
    }
    return map;
  }, [receipts]);

  const filtered = useMemo(() => {
    let result = [...locationSummaries];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.location_name.toLowerCase().includes(q));
    }
    if (regionFilter !== "all") {
      result = result.filter((s) => s.region_id === regionFilter);
    }
    if (complianceFilter !== "all") {
      switch (complianceFilter) {
        case "below_70":
          result = result.filter((s) => s.compliance_pct < 70);
          break;
        case "below_90":
          result = result.filter((s) => s.compliance_pct < 90);
          break;
        case "complete":
          result = result.filter((s) => s.compliance_pct === 100);
          break;
      }
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "location":
          cmp = a.location_name.localeCompare(b.location_name);
          break;
        case "region":
          cmp = a.region_name.localeCompare(b.region_name);
          break;
        case "staff":
          cmp = a.total_staff - b.total_staff;
          break;
        case "delivered":
          cmp = a.delivered - b.delivered;
          break;
        case "read":
          cmp = a.read - b.read;
          break;
        case "acknowledged":
          cmp = a.acknowledged - b.acknowledged;
          break;
        case "compliance":
          cmp = a.compliance_pct - b.compliance_pct;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [locationSummaries, search, regionFilter, complianceFilter, sortKey, sortDir]);

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

  if (!broadcast) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 py-16">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Broadcast not found</h3>
        <Link href={`/${locale}/comms/`}>
          <Button variant="secondary">Back to Broadcasts</Button>
        </Link>
      </div>
    );
  }

  const stats = broadcast.stats;
  const showAck = broadcast.acknowledgment_required;

  // Compute funnel values
  const totalRecipients = stats?.total_recipients ?? 0;
  const acknowledged = stats?.acknowledged ?? 0;
  const readNotAck = (stats?.read ?? 0) - acknowledged;
  const deliveredNotRead = (stats?.delivered ?? 0) - (stats?.read ?? 0);
  const unread = totalRecipients - (stats?.delivered ?? 0);

  // Unique region IDs for filter
  const uniqueRegions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of locationSummaries) {
      map.set(s.region_id, s.region_name);
    }
    return Array.from(map.entries());
  }, [locationSummaries]);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href={`/${locale}/comms/`} className="hover:text-[var(--accent-blue)] transition-colors">
          Broadcasts
        </Link>
        <span>&gt;</span>
        <span className="text-[var(--text-primary)]">
          {broadcast.id.replace("bc_", "BC-")}: {broadcast.title}
        </span>
      </div>

      <PageHeader
        title={broadcast.title}
        actions={
          <div className="flex items-center gap-2">
            <ExportReceiptsButton broadcastId={broadcast.id} />
            <Button variant="secondary" size="sm">
              <RefreshCw className="h-4 w-4" />
              Resend
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Summary Card */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="text-sm text-[var(--text-secondary)]">
            <strong>Sent:</strong>{" "}
            {broadcast.sent_at
              ? new Date(broadcast.sent_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })
              : "--"}
          </div>
          <div className="text-sm text-[var(--text-secondary)]">
            <strong>By:</strong> {getUserName(broadcast.created_by)}
          </div>
          <BroadcastStatusChip status={broadcast.status} />
          <BroadcastPriorityBadge priority={broadcast.priority} />
          {showAck && <Badge variant="blue">Acknowledgment Required</Badge>}
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4 lg:grid-cols-4">
              <div className="rounded-md bg-[var(--bg-primary)] p-3 text-center">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total_recipients}</p>
                <p className="text-xs text-[var(--text-muted)]">Recipients</p>
              </div>
              <div className="rounded-md bg-[var(--bg-primary)] p-3 text-center">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.delivered}</p>
                <p className="text-xs text-[var(--text-muted)]">Delivered ({((stats.delivered / stats.total_recipients) * 100).toFixed(1)}%)</p>
              </div>
              <div className="rounded-md bg-[var(--bg-primary)] p-3 text-center">
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.read}</p>
                <p className="text-xs text-[var(--text-muted)]">Read ({stats.open_rate.toFixed(1)}%)</p>
              </div>
              {showAck && (
                <div className="rounded-md bg-[var(--bg-primary)] p-3 text-center">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.acknowledged}</p>
                  <p className="text-xs text-[var(--text-muted)]">Acknowledged ({stats.ack_rate.toFixed(1)}%)</p>
                </div>
              )}
            </div>

            {/* Delivery Funnel */}
            <ReadReceiptProgressBar
              acknowledged={acknowledged}
              read={readNotAck > 0 ? readNotAck : 0}
              delivered={deliveredNotRead > 0 ? deliveredNotRead : 0}
              unread={unread > 0 ? unread : 0}
              total={totalRecipients}
            />

            {stats.failed > 0 && (
              <p className="mt-2 text-xs text-[var(--accent-red)]">
                Failed: {stats.failed} ({((stats.failed / stats.total_recipients) * 100).toFixed(1)}%)
              </p>
            )}
          </>
        )}
      </div>

      {/* Location Compliance Table */}
      <h3 className="text-base font-semibold text-[var(--text-primary)]">Location Compliance</h3>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search location..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-56"
        />
        <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            {uniqueRegions.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={complianceFilter} onValueChange={(v) => { setComplianceFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Compliance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="below_70">Below 70% (Critical)</SelectItem>
            <SelectItem value="below_90">Below 90% (Needs Attention)</SelectItem>
            <SelectItem value="complete">100% Complete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortButton label="Location" field="location" /></TableHead>
            <TableHead><SortButton label="Region" field="region" /></TableHead>
            <TableHead><SortButton label="Staff" field="staff" /></TableHead>
            <TableHead><SortButton label="Delivered" field="delivered" /></TableHead>
            <TableHead><SortButton label="Read" field="read" /></TableHead>
            {showAck && <TableHead><SortButton label="Ack'd" field="acknowledged" /></TableHead>}
            <TableHead><SortButton label="Compliance" field="compliance" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map((summary) => (
            <ReadReceiptRow
              key={summary.location_id}
              summary={summary}
              receipts={receiptsByLocation[summary.location_id] ?? []}
              showAck={showAck}
            />
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
