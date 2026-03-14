"use client";

import Link from "next/link";
import { Badge } from "@uniflo/ui";
import type { SOP } from "@uniflo/mock-data";
import { SOPStatusChip } from "./SOPStatusChip";
import { SOPCategoryBadge } from "./SOPCategoryBadge";

function timeAgo(dateStr: string): string {
  const now = new Date("2026-03-14T12:00:00Z");
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

interface SOPCardProps {
  sop: SOP;
  locale: string;
}

export function SOPCard({ sop, locale }: SOPCardProps) {
  return (
    <Link
      href={`/${locale}/sops/${sop.id}/`}
      className="block rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 hover:border-[var(--border-strong)] transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">{sop.title}</p>
        <Badge className="shrink-0">v{sop.version}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <SOPCategoryBadge category={sop.category} />
        <SOPStatusChip status={sop.status} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {sop.location_ids.length} location{sop.location_ids.length !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{timeAgo(sop.updated_at)}</span>
      </div>
    </Link>
  );
}
