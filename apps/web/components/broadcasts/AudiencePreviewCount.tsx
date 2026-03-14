"use client";

import { Users } from "lucide-react";

interface AudiencePreviewCountProps {
  regionCount: number;
  zoneCount: number;
  totalRecipients: number;
}

export function AudiencePreviewCount({ regionCount, zoneCount, totalRecipients }: AudiencePreviewCountProps) {
  if (totalRecipients === 0) {
    return (
      <div className="text-xs text-[var(--text-muted)]">No audience selected</div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
      <Users className="h-3.5 w-3.5 text-[var(--accent-blue)]" />
      <span>
        {regionCount} region{regionCount !== 1 ? "s" : ""}, {zoneCount} zone{zoneCount !== 1 ? "s" : ""},{" "}
        <strong className="text-[var(--text-primary)]">{totalRecipients} staff</strong>
      </span>
    </div>
  );
}
