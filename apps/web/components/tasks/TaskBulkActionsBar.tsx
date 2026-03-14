"use client";

import { Button } from "@uniflo/ui";
import { UserPlus, CheckCircle, FolderOpen, Download, X } from "lucide-react";

interface TaskBulkActionsBarProps {
  selectedCount: number;
  onAssign: () => void;
  onMarkDone: () => void;
  onChangeProject: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function TaskBulkActionsBar({ selectedCount, onAssign, onMarkDone, onChangeProject, onExport, onClear }: TaskBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-3 shadow-lg animate-in slide-in-from-bottom duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onAssign}>
            <UserPlus className="h-3.5 w-3.5" />
            Assign
          </Button>
          <Button variant="secondary" size="sm" onClick={onMarkDone}>
            <CheckCircle className="h-3.5 w-3.5" />
            Mark Done
          </Button>
          <Button variant="secondary" size="sm" onClick={onChangeProject}>
            <FolderOpen className="h-3.5 w-3.5" />
            Change Project
          </Button>
          <Button variant="secondary" size="sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
