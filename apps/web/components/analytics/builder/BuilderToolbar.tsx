"use client";

import { Button } from "@uniflo/ui";
import { ArrowLeft, Monitor, Tablet, Smartphone, Eye, Save, Share2, RotateCcw } from "lucide-react";

interface BuilderToolbarProps {
  dashboardName: string;
  onNameChange: (name: string) => void;
  viewportMode: "desktop" | "tablet" | "mobile";
  onViewportChange: (mode: "desktop" | "tablet" | "mobile") => void;
  previewMode: boolean;
  onPreviewToggle: () => void;
  onSave: () => void;
  onReset: () => void;
  hasUnsavedChanges: boolean;
}

const VIEWPORTS: Array<{ mode: "desktop" | "tablet" | "mobile"; icon: React.ElementType; label: string }> = [
  { mode: "desktop", icon: Monitor, label: "Desktop" },
  { mode: "tablet", icon: Tablet, label: "Tablet" },
  { mode: "mobile", icon: Smartphone, label: "Mobile" },
];

export function BuilderToolbar({
  dashboardName,
  onNameChange,
  viewportMode,
  onViewportChange,
  previewMode,
  onPreviewToggle,
  onSave,
  onReset,
  hasUnsavedChanges,
}: BuilderToolbarProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-2">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onPreviewToggle} aria-label="Back">
          <ArrowLeft size={16} />
        </Button>
        <input
          type="text"
          value={dashboardName}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-transparent border-none text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] rounded px-2 py-1 w-48"
        />
        {hasUnsavedChanges && (
          <span className="text-xs text-yellow-400">Unsaved changes</span>
        )}
      </div>

      <div className="flex items-center gap-1 rounded-md border border-[var(--border-default)] p-0.5">
        {VIEWPORTS.map((vp) => {
          const Icon = vp.icon;
          return (
            <button
              key={vp.mode}
              onClick={() => onViewportChange(vp.mode)}
              className={`p-1.5 rounded transition-colors ${
                viewportMode === vp.mode
                  ? "bg-[var(--accent-blue)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title={vp.label}
            >
              <Icon size={14} />
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onPreviewToggle}>
          <Eye size={14} />
          {previewMode ? "Edit" : "Preview"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onReset}>
          <RotateCcw size={14} />
          Reset
        </Button>
        <Button size="sm" onClick={onSave}>
          <Save size={14} />
          Save
        </Button>
      </div>
    </div>
  );
}
