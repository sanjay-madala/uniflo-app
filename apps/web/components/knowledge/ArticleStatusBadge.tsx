"use client";

import { Badge } from "@uniflo/ui";
import type { KBArticleStatus } from "@uniflo/mock-data";

const statusConfig: Record<KBArticleStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)] border-[var(--accent-yellow)]/30",
  },
  published: {
    label: "Published",
    className: "bg-[var(--accent-green)]/15 text-[var(--accent-green)] border-[var(--accent-green)]/30",
  },
  archived: {
    label: "Archived",
    className: "bg-[var(--text-muted)]/15 text-[var(--text-muted)] border-[var(--text-muted)]/30",
  },
};

interface ArticleStatusBadgeProps {
  status: KBArticleStatus;
}

export function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
}
