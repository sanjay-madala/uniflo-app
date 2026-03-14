"use client";

import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart,
  AreaChart,
  Table2,
  Activity,
  LayoutGrid,
  CreditCard,
} from "lucide-react";
import type { WidgetType } from "@uniflo/mock-data";

interface WidgetTypeOption {
  type: WidgetType;
  label: string;
  icon: React.ElementType;
  category: "charts" | "data" | "layout";
}

const WIDGET_TYPES: WidgetTypeOption[] = [
  { type: "kpi_card", label: "KPI Card", icon: CreditCard, category: "charts" },
  { type: "bar_chart", label: "Bar Chart", icon: BarChart3, category: "charts" },
  { type: "line_chart", label: "Line Chart", icon: LineChartIcon, category: "charts" },
  { type: "donut_chart", label: "Donut Chart", icon: PieChart, category: "charts" },
  { type: "table", label: "Table", icon: Table2, category: "data" },
  { type: "activity_feed", label: "Activity Feed", icon: Activity, category: "data" },
  { type: "scorecard", label: "Scorecard", icon: LayoutGrid, category: "data" },
  { type: "heatmap", label: "Heatmap", icon: LayoutGrid, category: "data" },
];

interface BuilderWidgetPaletteProps {
  onAddWidget: (type: WidgetType) => void;
}

export function BuilderWidgetPalette({ onAddWidget }: BuilderWidgetPaletteProps) {
  const categories = [
    { key: "charts" as const, label: "CHARTS" },
    { key: "data" as const, label: "DATA" },
  ];

  return (
    <div className="w-60 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-y-auto">
      <div className="p-3">
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Widget Palette
        </p>
        {categories.map((cat) => (
          <div key={cat.key} className="mb-4">
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              {cat.label}
            </p>
            <div className="space-y-1">
              {WIDGET_TYPES.filter((w) => w.category === cat.key).map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.type}
                    onClick={() => onAddWidget(widget.type)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("widget-type", widget.type);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-grab active:cursor-grabbing"
                    title="Drag to canvas or click to add"
                  >
                    <Icon size={16} />
                    <span>{widget.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
