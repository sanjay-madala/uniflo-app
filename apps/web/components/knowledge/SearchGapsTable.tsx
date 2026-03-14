"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Badge,
} from "@uniflo/ui";
import type { KBSearchGap } from "@uniflo/mock-data";
import { Plus, ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface SearchGapsTableProps {
  gaps: KBSearchGap[];
}

type SortKey = "search_count" | "last_searched_at";
type SortDir = "asc" | "desc";

function formatDate(dateStr: string): string {
  const now = new Date("2026-03-14T12:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function SearchGapsTable({ gaps }: SearchGapsTableProps) {
  const { locale } = useParams<{ locale: string }>();
  const [sortKey, setSortKey] = useState<SortKey>("search_count");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...gaps].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "search_count") {
      cmp = a.search_count - b.search_count;
    } else {
      cmp = new Date(a.last_searched_at).getTime() - new Date(b.last_searched_at).getTime();
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Searched Query</TableHead>
          <TableHead><SortButton label="Times" field="search_count" /></TableHead>
          <TableHead><SortButton label="Last Searched" field="last_searched_at" /></TableHead>
          <TableHead>Has Results?</TableHead>
          <TableHead className="text-end">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((gap) => (
          <TableRow key={gap.id}>
            <TableCell>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                &ldquo;{gap.query}&rdquo;
              </span>
            </TableCell>
            <TableCell className="text-sm text-[var(--text-secondary)]">{gap.search_count}</TableCell>
            <TableCell className="text-sm text-[var(--text-secondary)]">{formatDate(gap.last_searched_at)}</TableCell>
            <TableCell>
              {gap.has_results ? (
                <Badge className="bg-[var(--accent-green)]/15 text-[var(--accent-green)] border-[var(--accent-green)]/30">
                  {gap.result_count} result{gap.result_count !== 1 ? "s" : ""}
                </Badge>
              ) : (
                <Badge className="bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/30">
                  No results
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-end">
              {!gap.has_results && (
                <Link href={`/${locale}/knowledge/new?title=${encodeURIComponent(gap.query)}`}>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-3.5 w-3.5" /> Create Article
                  </Button>
                </Link>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
