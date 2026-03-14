"use client";

import { Badge } from "@uniflo/ui";
import { Globe, Lock } from "lucide-react";
import type { KBVisibility } from "@uniflo/mock-data";

interface VisibilityToggleProps {
  visibility: KBVisibility;
  onChange?: (visibility: KBVisibility) => void;
  readOnly?: boolean;
}

export function VisibilityToggle({ visibility, onChange, readOnly = false }: VisibilityToggleProps) {
  if (readOnly) {
    return (
      <Badge className={
        visibility === "public"
          ? "bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] border-[var(--accent-blue)]/30"
          : "bg-[var(--text-muted)]/15 text-[var(--text-secondary)] border-[var(--text-muted)]/30"
      }>
        {visibility === "public" ? (
          <><Globe className="h-3 w-3 mr-1" /> Public</>
        ) : (
          <><Lock className="h-3 w-3 mr-1" /> Internal</>
        )}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-0.5">
      <button
        type="button"
        onClick={() => onChange?.("internal")}
        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
          visibility === "internal"
            ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
      >
        <Lock className="h-3 w-3" /> Internal
      </button>
      <button
        type="button"
        onClick={() => onChange?.("public")}
        className={`flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
          visibility === "public"
            ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
      >
        <Globe className="h-3 w-3" /> Public
      </button>
    </div>
  );
}
