"use client";

import { Button, Input } from "@uniflo/ui";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@uniflo/ui";
import { X } from "lucide-react";
import type { DashboardWidget, WidgetDataSource } from "@uniflo/mock-data";

interface BuilderWidgetConfigPanelProps {
  widget: DashboardWidget;
  onUpdate: (updates: Partial<DashboardWidget>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const DATA_SOURCES: Array<{ value: WidgetDataSource; label: string }> = [
  { value: "tickets", label: "Tickets" },
  { value: "audits", label: "Audits" },
  { value: "capa", label: "CAPA" },
  { value: "tasks", label: "Tasks" },
  { value: "sla", label: "SLA" },
  { value: "cross_module", label: "Cross-Module" },
];

const METRICS_BY_SOURCE: Record<string, Array<{ value: string; label: string }>> = {
  tickets: [
    { value: "volume", label: "Volume by Week" },
    { value: "avg_resolution", label: "Avg Resolution" },
    { value: "sla_compliance", label: "SLA Compliance" },
    { value: "by_category", label: "By Category" },
  ],
  audits: [
    { value: "avg_score", label: "Avg Score" },
    { value: "pass_rate", label: "Pass Rate" },
    { value: "by_location", label: "By Location" },
    { value: "score_trend", label: "Score Trend" },
  ],
  capa: [
    { value: "open_count", label: "Open Count" },
    { value: "closure_rate", label: "Closure Rate" },
    { value: "by_severity", label: "By Severity" },
    { value: "recurrence", label: "Recurrence" },
  ],
  tasks: [
    { value: "velocity", label: "Velocity" },
    { value: "overdue_rate", label: "Overdue Rate" },
    { value: "by_assignee", label: "By Assignee" },
    { value: "completion_trend", label: "Completion Trend" },
  ],
  sla: [
    { value: "compliance_pct", label: "Compliance %" },
    { value: "breaches", label: "Breaches" },
  ],
  cross_module: [
    { value: "health_score", label: "Health Score" },
    { value: "compliance_trend", label: "Compliance Trend" },
  ],
};

export function BuilderWidgetConfigPanel({
  widget,
  onUpdate,
  onDelete,
  onClose,
}: BuilderWidgetConfigPanelProps) {
  const metrics = METRICS_BY_SOURCE[widget.data_source] ?? [];

  return (
    <div className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-y-auto">
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-default)]">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Widget Configuration</p>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X size={16} />
        </button>
      </div>

      <div className="p-3 space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Title</label>
          <Input
            value={widget.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Data Source</label>
          <Select
            value={widget.data_source}
            onValueChange={(v) => onUpdate({ data_source: v as WidgetDataSource, metric: undefined })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DATA_SOURCES.map((ds) => (
                <SelectItem key={ds.value} value={ds.value}>{ds.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {metrics.length > 0 && (
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Metric</label>
            <Select
              value={widget.metric ?? ""}
              onValueChange={(v) => onUpdate({ metric: v })}
            >
              <SelectTrigger><SelectValue placeholder="Select metric" /></SelectTrigger>
              <SelectContent>
                {metrics.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)] mb-1 block">Color</label>
          <div className="flex gap-2">
            {["#58A6FF", "#3FB950", "#F85149", "#D29922", "#BC8CFF", "#388BFD"].map((color) => (
              <button
                key={color}
                onClick={() => onUpdate({ chart_config: { ...widget.chart_config, data_key: widget.chart_config?.data_key ?? "value", color } })}
                className={`h-6 w-6 rounded-full border-2 transition-colors ${
                  widget.chart_config?.color === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-default)]">
          <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
            Delete Widget
          </Button>
        </div>
      </div>
    </div>
  );
}
