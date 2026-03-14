"use client";

import { useState, useCallback } from "react";
import type { DashboardWidget, WidgetType, WidgetDataSource } from "@uniflo/mock-data";
import { BuilderToolbar } from "./BuilderToolbar";
import { BuilderWidgetPalette } from "./BuilderWidgetPalette";
import { BuilderWidgetCard } from "./BuilderWidgetCard";
import { BuilderWidgetConfigPanel } from "./BuilderWidgetConfigPanel";

let widgetCounter = 0;

function createWidget(type: WidgetType, position: { x: number; y: number }): DashboardWidget {
  widgetCounter += 1;
  const defaultSizes: Record<WidgetType, { w: number; h: number }> = {
    kpi_card: { w: 1, h: 1 },
    bar_chart: { w: 2, h: 2 },
    line_chart: { w: 2, h: 2 },
    donut_chart: { w: 2, h: 2 },
    table: { w: 2, h: 2 },
    activity_feed: { w: 1, h: 2 },
    heatmap: { w: 2, h: 2 },
    scorecard: { w: 1, h: 1 },
  };

  const typeLabels: Record<WidgetType, string> = {
    kpi_card: "KPI Card",
    bar_chart: "Bar Chart",
    line_chart: "Line Chart",
    donut_chart: "Donut Chart",
    table: "Data Table",
    activity_feed: "Activity Feed",
    heatmap: "Heatmap",
    scorecard: "Scorecard",
  };

  return {
    id: `widget_${widgetCounter}`,
    type,
    title: typeLabels[type] ?? "Widget",
    data_source: "cross_module" as WidgetDataSource,
    position,
    size: defaultSizes[type] ?? { w: 2, h: 2 },
  };
}

export function BuilderCanvas() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [viewportMode, setViewportMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [dashboardName, setDashboardName] = useState("My Custom Dashboard");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId) ?? null;

  const gridCols = viewportMode === "desktop" ? 4 : viewportMode === "tablet" ? 3 : 1;

  const findNextPosition = useCallback((): { x: number; y: number } => {
    if (widgets.length === 0) return { x: 0, y: 0 };
    const maxY = Math.max(...widgets.map((w) => w.position.y + w.size.h));
    return { x: 0, y: maxY };
  }, [widgets]);

  const handleAddWidget = useCallback(
    (type: WidgetType) => {
      const pos = findNextPosition();
      const widget = createWidget(type, pos);
      setWidgets((prev) => [...prev, widget]);
      setSelectedWidgetId(widget.id);
      setHasUnsavedChanges(true);
    },
    [findNextPosition]
  );

  const handleRemoveWidget = useCallback(
    (id: string) => {
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      if (selectedWidgetId === id) setSelectedWidgetId(null);
      setHasUnsavedChanges(true);
    },
    [selectedWidgetId]
  );

  const handleUpdateWidget = useCallback(
    (id: string, updates: Partial<DashboardWidget>) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
      );
      setHasUnsavedChanges(true);
    },
    []
  );

  const handleSave = () => {
    try {
      localStorage.setItem(
        "uniflo-custom-dashboard",
        JSON.stringify({ name: dashboardName, widgets })
      );
    } catch {
      // localStorage may not be available
    }
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setWidgets([]);
    setSelectedWidgetId(null);
    setHasUnsavedChanges(false);
  };

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const widgetType = e.dataTransfer.getData("widget-type") as WidgetType;
      if (widgetType) {
        const rect = e.currentTarget.getBoundingClientRect();
        const cellWidth = rect.width / gridCols;
        const cellHeight = 100;
        const x = Math.min(Math.floor((e.clientX - rect.left) / cellWidth), gridCols - 1);
        const y = Math.floor((e.clientY - rect.top) / cellHeight);
        const widget = createWidget(widgetType, { x, y });
        setWidgets((prev) => [...prev, widget]);
        setSelectedWidgetId(widget.id);
        setHasUnsavedChanges(true);
      }
    },
    [gridCols]
  );

  if (viewportMode === "mobile") {
    return (
      <div className="flex flex-col">
        <BuilderToolbar
          dashboardName={dashboardName}
          onNameChange={setDashboardName}
          viewportMode={viewportMode}
          onViewportChange={setViewportMode}
          previewMode={previewMode}
          onPreviewToggle={() => setPreviewMode(!previewMode)}
          onSave={handleSave}
          onReset={handleReset}
          hasUnsavedChanges={hasUnsavedChanges}
        />
        <div className="flex items-center justify-center p-12 text-center">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Dashboard builder requires a desktop browser
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              View your dashboards in read-only mode on mobile devices.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <BuilderToolbar
        dashboardName={dashboardName}
        onNameChange={setDashboardName}
        viewportMode={viewportMode}
        onViewportChange={setViewportMode}
        previewMode={previewMode}
        onPreviewToggle={() => setPreviewMode(!previewMode)}
        onSave={handleSave}
        onReset={handleReset}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="flex flex-1 overflow-hidden">
        {!previewMode && <BuilderWidgetPalette onAddWidget={handleAddWidget} />}

        <div
          className="flex-1 overflow-auto p-6"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleCanvasDrop}
          onClick={() => setSelectedWidgetId(null)}
        >
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--border-default)] rounded-lg">
              <p className="text-sm text-[var(--text-muted)]">
                Drag widgets from the palette or click to add
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Build your custom dashboard layout
              </p>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              }}
            >
              {widgets.map((widget) => (
                <BuilderWidgetCard
                  key={widget.id}
                  widget={widget}
                  isSelected={selectedWidgetId === widget.id}
                  onSelect={() => setSelectedWidgetId(widget.id)}
                  onRemove={() => handleRemoveWidget(widget.id)}
                  previewMode={previewMode}
                />
              ))}
            </div>
          )}

          {!previewMode && widgets.length > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, var(--border-default) 1px, transparent 1px),
                  linear-gradient(to bottom, var(--border-default) 1px, transparent 1px)
                `,
                backgroundSize: `${100 / gridCols}% 100px`,
                opacity: 0.15,
              }}
            />
          )}
        </div>

        {!previewMode && selectedWidget && (
          <BuilderWidgetConfigPanel
            widget={selectedWidget}
            onUpdate={(updates) => handleUpdateWidget(selectedWidget.id, updates)}
            onDelete={() => handleRemoveWidget(selectedWidget.id)}
            onClose={() => setSelectedWidgetId(null)}
          />
        )}
      </div>
    </div>
  );
}
