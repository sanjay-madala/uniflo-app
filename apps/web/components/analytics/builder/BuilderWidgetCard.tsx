"use client";

import { X, GripVertical } from "lucide-react";
import type { DashboardWidget } from "@uniflo/mock-data";

interface BuilderWidgetCardProps {
  widget: DashboardWidget;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  previewMode: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  kpi_card: "KPI Card",
  bar_chart: "Bar Chart",
  line_chart: "Line Chart",
  donut_chart: "Donut Chart",
  table: "Table",
  activity_feed: "Activity Feed",
  heatmap: "Heatmap",
  scorecard: "Scorecard",
};

export function BuilderWidgetCard({
  widget,
  isSelected,
  onSelect,
  onRemove,
  previewMode,
}: BuilderWidgetCardProps) {
  return (
    <div
      className={`relative rounded-lg border transition-colors bg-[var(--bg-secondary)] ${
        isSelected && !previewMode
          ? "border-[var(--accent-blue)] ring-1 ring-[var(--accent-blue)]"
          : "border-[var(--border-default)]"
      } ${!previewMode ? "cursor-pointer" : ""}`}
      style={{
        gridColumn: `span ${widget.size.w}`,
        gridRow: `span ${widget.size.h}`,
        minHeight: widget.size.h === 1 ? 100 : widget.size.h === 2 ? 200 : 300,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!previewMode) onSelect();
      }}
      draggable={!previewMode}
      onDragStart={(e) => {
        e.dataTransfer.setData("widget-id", widget.id);
      }}
    >
      {!previewMode && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="text-[var(--text-muted)] cursor-grab active:cursor-grabbing">
            <GripVertical size={14} />
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors p-0.5"
            aria-label="Remove widget"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="p-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">{widget.title}</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">{TYPE_LABELS[widget.type] ?? widget.type}</p>
        <div className="mt-3 flex items-center justify-center h-16 rounded bg-[var(--bg-tertiary)]">
          <span className="text-xs text-[var(--text-muted)]">
            {widget.data_source} / {widget.metric ?? "default"}
          </span>
        </div>
      </div>
    </div>
  );
}
