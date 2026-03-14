"use client";

import { Button } from "@uniflo/ui";
import { Archive, UserPlus, X } from "lucide-react";

interface GoalBulkActionsBarProps {
  selectedCount: number;
  onArchive: () => void;
  onReassign: () => void;
  onClear: () => void;
}

export function GoalBulkActionsBar({
  selectedCount,
  onArchive,
  onReassign,
  onClear,
}: GoalBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] px-5 py-3 shadow-2xl">
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-[var(--border-default)]" />
      <Button variant="secondary" size="sm" onClick={onArchive}>
        <Archive className="h-3.5 w-3.5" />
        Archive
      </Button>
      <Button variant="secondary" size="sm" onClick={onReassign}>
        <UserPlus className="h-3.5 w-3.5" />
        Reassign
      </Button>
      <button
        type="button"
        onClick={onClear}
        className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
