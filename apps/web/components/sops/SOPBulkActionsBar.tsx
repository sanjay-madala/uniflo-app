"use client";

import { Button } from "@uniflo/ui";
import { Upload, Archive, MapPin, Download, X } from "lucide-react";

interface SOPBulkActionsBarProps {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  onAssignLocations: () => void;
  onExport: () => void;
  onClear: () => void;
}

export function SOPBulkActionsBar({ selectedCount, onPublish, onArchive, onAssignLocations, onExport, onClear }: SOPBulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-secondary)] px-6 py-3 shadow-lg animate-in slide-in-from-bottom duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {selectedCount} SOP{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onPublish}>
            <Upload className="h-3.5 w-3.5" />
            Publish
          </Button>
          <Button variant="secondary" size="sm" onClick={onArchive}>
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>
          <Button variant="secondary" size="sm" onClick={onAssignLocations}>
            <MapPin className="h-3.5 w-3.5" />
            Assign Locations
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
