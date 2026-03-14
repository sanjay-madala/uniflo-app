"use client";

import type { GoalModuleLink } from "@uniflo/mock-data";
import { Badge } from "@uniflo/ui";
import { TrendingUp, TrendingDown } from "lucide-react";

interface LinkedEvidenceCardProps {
  link: GoalModuleLink;
  krTitle?: string;
}

const moduleIcons: Record<string, string> = {
  audits: "clipboard-check",
  tickets: "ticket",
  capa: "shield-alert",
  tasks: "check-square",
  training: "graduation-cap",
  sops: "book-open",
  csat: "smile",
};

export function LinkedEvidenceCard({ link, krTitle }: LinkedEvidenceCardProps) {
  const trendPositive = link.trend > 0;

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="blue" className="capitalize">{link.module}</Badge>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{link.label}</span>
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendPositive ? "text-[var(--accent-green)]" : "text-[var(--accent-red)]"}`}>
          {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendPositive ? "+" : ""}{link.trend}%
        </div>
      </div>

      {/* Feeding KR */}
      {krTitle && (
        <p className="text-xs text-[var(--text-muted)] mb-3">
          Feeding KR: &ldquo;{krTitle}&rdquo;
        </p>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-lg font-bold text-[var(--text-primary)]">{link.current_value}</div>
          <div className="text-xs text-[var(--text-muted)]">Current</div>
        </div>
        <div>
          <div className="text-lg font-bold text-[var(--text-secondary)]">{link.entity_count}</div>
          <div className="text-xs text-[var(--text-muted)]">Entities</div>
        </div>
        <div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            Updated {new Date(link.last_updated).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        </div>
      </div>
    </div>
  );
}
