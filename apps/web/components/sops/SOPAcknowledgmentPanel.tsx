"use client";

import { useState, useMemo } from "react";
import {
  KPICard,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Input, Badge,
} from "@uniflo/ui";
import type { SOPAcknowledgment } from "@uniflo/mock-data";
import { users } from "@uniflo/mock-data";
import { ProgressRing } from "./ProgressRing";
import { Send, ArrowUpDown } from "lucide-react";

interface SOPAcknowledgmentPanelProps {
  acknowledgments: SOPAcknowledgment[];
}

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

type AckFilter = "all" | "acknowledged" | "pending";
type SortKey = "name" | "role" | "location" | "status" | "date";
type SortDir = "asc" | "desc";

export function SOPAcknowledgmentPanel({ acknowledgments }: SOPAcknowledgmentPanelProps) {
  const [ackFilter, setAckFilter] = useState<AckFilter>("all");
  const [ackSearch, setAckSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const enriched = useMemo(() =>
    acknowledgments.map(ack => {
      const user = users.find(u => u.id === ack.user_id);
      return {
        ...ack,
        name: user?.name ?? ack.user_id,
        role: user?.role ?? "unknown",
        location: user ? (locationLabels[user.location_id] ?? user.location_id) : "Unknown",
        isAcknowledged: ack.acknowledged_at !== null,
      };
    }),
    [acknowledgments]
  );

  const acknowledgedCount = enriched.filter(a => a.isAcknowledged).length;
  const pendingCount = enriched.filter(a => !a.isAcknowledged).length;
  const percentage = enriched.length > 0 ? Math.round((acknowledgedCount / enriched.length) * 100) : 0;

  const filtered = useMemo(() => {
    let result = [...enriched];

    if (ackFilter === "acknowledged") result = result.filter(a => a.isAcknowledged);
    else if (ackFilter === "pending") result = result.filter(a => !a.isAcknowledged);

    if (ackSearch) {
      const q = ackSearch.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "role": cmp = a.role.localeCompare(b.role); break;
        case "location": cmp = a.location.localeCompare(b.location); break;
        case "status": cmp = (a.isAcknowledged ? 1 : 0) - (b.isAcknowledged ? 1 : 0); break;
        case "date":
          cmp = (a.acknowledged_at ?? "9999").localeCompare(b.acknowledged_at ?? "9999");
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [enriched, ackFilter, ackSearch, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
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

  const filterButtons: { label: string; value: AckFilter }[] = [
    { label: "All", value: "all" },
    { label: "Acknowledged", value: "acknowledged" },
    { label: "Pending", value: "pending" },
  ];

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard title="Total Assigned" value={enriched.length} />
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Acknowledged</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[var(--text-primary)]">{acknowledgedCount}</span>
                <span className="text-lg text-[var(--accent-green)]">({percentage}%)</span>
              </div>
            </div>
            <ProgressRing percentage={percentage} size={48} />
          </div>
        </div>
        <KPICard title="Pending" value={pendingCount} color="var(--accent-amber)" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-md border border-[var(--border-default)] overflow-hidden">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setAckFilter(btn.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                ackFilter === btn.value
                  ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <Input
          placeholder="Search by name..."
          value={ackSearch}
          onChange={e => setAckSearch(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortButton label="Name" field="name" /></TableHead>
            <TableHead><SortButton label="Role" field="role" /></TableHead>
            <TableHead><SortButton label="Location" field="location" /></TableHead>
            <TableHead><SortButton label="Status" field="status" /></TableHead>
            <TableHead><SortButton label="Date" field="date" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(ack => (
            <TableRow key={ack.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[10px] font-medium text-[var(--accent-blue)]">
                    {ack.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{ack.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-[var(--text-secondary)] capitalize">{ack.role.replace("_", " ")}</TableCell>
              <TableCell className="text-sm text-[var(--text-secondary)]">{ack.location}</TableCell>
              <TableCell>
                {ack.isAcknowledged ? (
                  <Badge variant="success">Acknowledged</Badge>
                ) : (
                  <Badge variant="warning">Pending</Badge>
                )}
              </TableCell>
              <TableCell className="text-xs text-[var(--text-secondary)]">
                {ack.acknowledged_at
                  ? new Date(ack.acknowledged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "\u2014"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Send reminder */}
      {pendingCount > 0 && (
        <Button variant="secondary" onClick={() => {}}>
          <Send className="h-3.5 w-3.5" />
          Send Reminder to Pending ({pendingCount})
        </Button>
      )}
    </div>
  );
}
