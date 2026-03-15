"use client";

import { useState, useMemo } from "react";
import { PageHeader, Button } from "@uniflo/ui";
import { Download } from "lucide-react";
import { useDashboardData } from "@/lib/data/useDashboardData";
import type { DateRange, DateRangePreset } from "@uniflo/mock-data";
import { DashboardKPIRow } from "@/components/dashboard/DashboardKPIRow";
import { DashboardTrendChart } from "@/components/dashboard/DashboardTrendChart";
import { DashboardActivityFeed } from "@/components/dashboard/DashboardActivityFeed";
import { DashboardLocationFilter } from "@/components/dashboard/DashboardLocationFilter";
import { DashboardComplianceHeatmap } from "@/components/dashboard/DashboardComplianceHeatmap";
import { DashboardSLASummary } from "@/components/dashboard/DashboardSLASummary";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardModuleBreakdown } from "@/components/dashboard/DashboardModuleBreakdown";
import { DashboardDateRangePicker } from "@/components/dashboard/DashboardDateRangePicker";
import { ExportModal } from "@/components/analytics/ExportModal";

export default function DashboardClient() {
  const {
    kpis: dashboardKPIs,
    trendData,
    activityEvents,
    locationTree,
    crossModuleSummary,
    auditHeatmapData,
    isLoading,
    error,
  } = useDashboardData();

  const [dateRange, setDateRange] = useState<DateRange>({
    start: "2026-02-13",
    end: "2026-03-14",
  });
  const [datePreset, setDatePreset] = useState<DateRangePreset>("last_30_days");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    const end = "2026-03-14";
    let start = "2026-02-13";
    switch (preset) {
      case "last_7_days": start = "2026-03-07"; break;
      case "last_30_days": start = "2026-02-13"; break;
      case "last_90_days": start = "2025-12-15"; break;
      case "this_quarter": start = "2026-01-01"; break;
    }
    setDateRange({ start, end });
  };

  // Filter trend data based on date range
  const filteredTrendData = useMemo(() => {
    if (datePreset === "last_7_days") return trendData.slice(-7);
    if (datePreset === "last_30_days") return trendData.slice(-30);
    return trendData;
  }, [datePreset, trendData]);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="h-8 w-64 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded bg-[var(--bg-tertiary)] animate-pulse" />
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load dashboard: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Operations Dashboard"
        subtitle="Real-time overview across all modules"
        actions={
          <div className="flex items-center gap-3">
            <DashboardDateRangePicker preset={datePreset} onPresetChange={handlePresetChange} />
            <DashboardLocationFilter
              tree={locationTree}
              selectedLocationId={selectedLocationId}
              onSelect={setSelectedLocationId}
            />
            <Button variant="secondary" size="sm" onClick={() => setIsExportOpen(true)}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* KPI Cards Row */}
      <DashboardKPIRow kpis={dashboardKPIs} />

      {/* Row 2: Trend Chart + Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <DashboardTrendChart data={filteredTrendData} />
          <DashboardModuleBreakdown summary={crossModuleSummary} />
        </div>
        <div className="lg:col-span-5">
          <DashboardActivityFeed events={activityEvents} maxVisible={10} />
        </div>
      </div>

      {/* Row 3: Heatmap + SLA + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <DashboardComplianceHeatmap data={auditHeatmapData} />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <DashboardSLASummary summary={crossModuleSummary} />
          <DashboardQuickActions />
        </div>
      </div>

      <ExportModal open={isExportOpen} onOpenChange={setIsExportOpen} />
    </div>
  );
}
