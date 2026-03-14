"use client";

import Link from "next/link";
import type { CAPA, User } from "@uniflo/mock-data";
import { CAPASeverityBadge } from "./CAPASeverityBadge";
import { CAPAStatusChip } from "./CAPAStatusChip";
import { CAPASourceBadge } from "./CAPASourceBadge";
import { CAPAStatusTimeline } from "./CAPAStatusTimeline";

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

interface CAPACardProps {
  capa: CAPA;
  users: User[];
  locale: string;
  isOverdue: boolean;
}

export function CAPACard({ capa, users, locale, isOverdue }: CAPACardProps) {
  const owner = users.find(u => u.id === capa.owner_id);

  return (
    <Link
      href={`/${locale}/capa/${capa.id}/`}
      className={`block rounded-md border bg-[var(--bg-secondary)] p-3 hover:border-[var(--border-strong)] transition-colors ${isOverdue ? "border-l-2 border-l-[var(--accent-red)] border-[var(--border-default)]" : "border-[var(--border-default)]"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2">{capa.title}</p>
        {owner && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/20 text-[10px] font-medium text-[var(--accent-blue)]">
            {getInitials(owner.name)}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <CAPASeverityBadge severity={capa.severity} />
        <CAPAStatusChip status={capa.status} />
        <CAPASourceBadge source={capa.source} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <CAPAStatusTimeline status={capa.status} variant="compact" />
        <span className="text-xs text-[var(--text-muted)]">
          Due {new Date(capa.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </Link>
  );
}
