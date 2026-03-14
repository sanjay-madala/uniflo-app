"use client";

import { FileText, Image, Link as LinkIcon } from "lucide-react";
import type { CAPAAction } from "@uniflo/mock-data";

interface ResolutionLogProps {
  actions?: CAPAAction[];
}

function getFileIcon(type: string) {
  switch (type) {
    case "photo":
      return Image;
    case "link":
      return LinkIcon;
    default:
      return FileText;
  }
}

export function ResolutionLog({ actions }: ResolutionLogProps) {
  if (!actions || actions.length === 0) return null;

  const completedActions = actions.filter(a => a.status === "completed" && (a.evidence || a.notes));

  if (completedActions.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">Resolution Log</h3>
      <div className="space-y-3">
        {completedActions.map(action => (
          <div
            key={action.id}
            className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 space-y-2"
          >
            <p className="text-sm text-[var(--text-primary)]">{action.description}</p>
            {action.notes && (
              <p className="text-xs text-[var(--text-secondary)] italic">{action.notes}</p>
            )}
            {action.evidence && action.evidence.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {action.evidence.map((ev, i) => {
                  const Icon = getFileIcon(ev.type);
                  return (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded border border-[var(--border-default)] bg-[var(--bg-tertiary, var(--bg-secondary))] px-2 py-1 text-xs text-[var(--text-secondary)]"
                    >
                      <Icon className="h-3 w-3" />
                      {ev.name}
                    </div>
                  );
                })}
              </div>
            )}
            {action.completed_at && (
              <p className="text-xs text-[var(--text-muted)]">
                Completed {new Date(action.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
