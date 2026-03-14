"use client";

import { Drawer, Button, Badge } from "@uniflo/ui";
import type { SOPVersion } from "@uniflo/mock-data";
import { users } from "@uniflo/mock-data";
import { SOPStatusChip } from "./SOPStatusChip";
import { Clock, Eye, GitCompare, RotateCcw } from "lucide-react";

interface SOPVersionHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: SOPVersion[];
  currentVersion: string;
}

function getUserName(id: string): string {
  const u = users.find(u => u.id === id);
  return u?.name ?? id;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SOPVersionHistoryDrawer({
  open,
  onOpenChange,
  versions,
  currentVersion,
}: SOPVersionHistoryDrawerProps) {
  const sortedVersions = [...versions].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Version History"
      description={`Current: v${currentVersion}`}
      width="w-[480px]"
      footer={
        sortedVersions.length > 1 ? (
          <Button variant="secondary" onClick={() => {}}>
            <RotateCcw className="h-3.5 w-3.5" />
            Restore Previous Version
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {sortedVersions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-tertiary)]">
              <Clock className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-secondary)]">This is the first version</p>
          </div>
        ) : (
          sortedVersions.map((version, idx) => {
            const isCurrent = version.version === currentVersion;
            return (
              <div
                key={version.id}
                className={`rounded-lg border p-4 ${
                  isCurrent
                    ? "border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/5"
                    : "border-[var(--border-default)] bg-[var(--bg-primary)]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">v{version.version}</span>
                    {isCurrent && <Badge variant="blue">Current</Badge>}
                  </div>
                  <SOPStatusChip status={version.status} />
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-1">
                  {formatDate(version.created_at)} by {getUserName(version.created_by)}
                </p>
                <p className="text-sm text-[var(--text-secondary)] italic">
                  &ldquo;{version.change_summary}&rdquo;
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    <Eye className="h-3 w-3" /> View
                  </Button>
                  {idx < sortedVersions.length - 1 && (
                    <Button variant="ghost" size="sm" className="text-xs h-7">
                      <GitCompare className="h-3 w-3" /> Compare with previous
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Drawer>
  );
}
