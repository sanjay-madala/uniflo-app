"use client";

import { useState } from "react";
import { Modal, Button, Checkbox } from "@uniflo/ui";
import { FileText, Table2, FileSpreadsheet, Download } from "lucide-react";
import type { ExportFormat, WidgetDataSource } from "@uniflo/mock-data";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportScope = "current_view" | "custom_range" | "full_report";

const FORMAT_OPTIONS: Array<{ value: ExportFormat; label: string; desc: string; icon: React.ElementType }> = [
  { value: "pdf", label: "PDF Report", desc: "Charts + tables", icon: FileText },
  { value: "csv", label: "CSV Data", desc: "Raw data only", icon: Table2 },
  { value: "xlsx", label: "Excel", desc: "Data + formatting", icon: FileSpreadsheet },
];

const MODULE_OPTIONS: Array<{ value: WidgetDataSource; label: string }> = [
  { value: "tickets", label: "Tickets" },
  { value: "audits", label: "Audits" },
  { value: "capa", label: "CAPA" },
  { value: "tasks", label: "Tasks" },
  { value: "sla", label: "SLA" },
];

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [scope, setScope] = useState<ExportScope>("current_view");
  const [selectedModules, setSelectedModules] = useState<Set<WidgetDataSource>>(
    new Set(["tickets", "audits", "capa", "tasks", "sla"])
  );
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const toggleModule = (mod: WidgetDataSource) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(mod)) next.delete(mod);
      else next.add(mod);
      return next;
    });
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simulate export delay
    setTimeout(() => {
      const filename = `report-2026-03-14.${format}`;
      const content = format === "csv" ? "Module,Metric,Value\nTickets,Open,23\nCompliance,Score,87" : "Mock report content";
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      onOpenChange(false);
    }, 800);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Export Report"
      description="Generate a downloadable report from current view"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Download"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Format</p>
          <div className="grid grid-cols-3 gap-3">
            {FORMAT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = format === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setFormat(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                    isSelected
                      ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/10"
                      : "border-[var(--border-default)] hover:border-[var(--text-muted)]"
                  }`}
                >
                  <Icon size={24} className={isSelected ? "text-[var(--accent-blue)]" : "text-[var(--text-secondary)]"} />
                  <span className={`text-sm font-medium ${isSelected ? "text-[var(--accent-blue)]" : "text-[var(--text-primary)]"}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scope */}
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Scope</p>
          <div className="space-y-2">
            {([
              { value: "current_view" as ExportScope, label: "Current View", desc: "Export what's currently on screen" },
              { value: "custom_range" as ExportScope, label: "Custom Range", desc: "Select dates and modules" },
              { value: "full_report" as ExportScope, label: "Full Report", desc: "All modules, all time" },
            ]).map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                  scope === opt.value
                    ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/5"
                    : "border-[var(--border-default)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                <input
                  type="radio"
                  name="scope"
                  value={opt.value}
                  checked={scope === opt.value}
                  onChange={() => setScope(opt.value)}
                  className="accent-[var(--accent-blue)]"
                />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Modules (shown for custom_range) */}
        {scope === "custom_range" && (
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Modules</p>
            <div className="flex flex-wrap gap-3">
              {MODULE_OPTIONS.map((mod) => (
                <label key={mod.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedModules.has(mod.value)}
                    onCheckedChange={() => toggleModule(mod.value)}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{mod.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)] mb-3">Options</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={includeCharts} onCheckedChange={(v) => setIncludeCharts(v === true)} />
              <span className="text-sm text-[var(--text-primary)]">Include charts and visualizations</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={includeRawData} onCheckedChange={(v) => setIncludeRawData(v === true)} />
              <span className="text-sm text-[var(--text-primary)]">Include raw data tables</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border border-[var(--border-default)] overflow-hidden">
          <div className="px-4 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Report Preview</p>
          </div>
          {/* print-only: intentionally uses light colors for print output */}
          <div className="p-4 bg-[var(--bg-primary)] text-[var(--text-primary)] max-h-48 overflow-y-auto">
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-sm">Executive Summary</p>
                <p className="text-[var(--text-secondary)]">Date range: Feb 13 - Mar 14, 2026</p>
                <p className="text-[var(--text-secondary)]">Scope: All locations</p>
              </div>
              <div className="border-t border-[var(--border-default)] pt-2">
                <p className="font-semibold">KPI Summary</p>
                <table className="w-full mt-1">
                  <tbody>
                    <tr><td className="text-[var(--text-secondary)]">Open Tickets</td><td className="text-right font-medium">23</td></tr>
                    <tr><td className="text-[var(--text-secondary)]">Compliance Score</td><td className="text-right font-medium">87%</td></tr>
                    <tr><td className="text-[var(--text-secondary)]">SLA Compliance</td><td className="text-right font-medium">94%</td></tr>
                    <tr><td className="text-[var(--text-secondary)]">CSAT Score</td><td className="text-right font-medium">4.2/5</td></tr>
                  </tbody>
                </table>
              </div>
              {includeCharts && (
                <div className="border-t border-[var(--border-default)] pt-2">
                  <p className="font-semibold">Charts</p>
                  <div className="mt-1 h-12 bg-[var(--bg-secondary)] rounded flex items-center justify-center text-[var(--text-muted)]">
                    [Trend chart thumbnail]
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
