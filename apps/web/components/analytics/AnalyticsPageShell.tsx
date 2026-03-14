"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@uniflo/ui";
import { Download, ChevronRight, Home } from "lucide-react";
import { DashboardDateRangePicker } from "@/components/dashboard/DashboardDateRangePicker";
import { DashboardLocationFilter } from "@/components/dashboard/DashboardLocationFilter";
import { ExportModal } from "@/components/analytics/ExportModal";
import { locationTree } from "@uniflo/mock-data";
import type { DateRangePreset } from "@uniflo/mock-data";

interface TabDef {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface AnalyticsPageShellProps {
  title: string;
  breadcrumb: string;
  tabs?: TabDef[];
  children?: React.ReactNode;
}

export function AnalyticsPageShell({ title, breadcrumb, tabs, children }: AnalyticsPageShellProps) {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [datePreset, setDatePreset] = useState<DateRangePreset>("last_30_days");
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title={title}
        breadcrumb={
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href={`/${locale}/dashboard/`} className="hover:text-[var(--accent-blue)] transition-colors">
              <Home size={12} />
            </Link>
            <ChevronRight size={12} />
            <Link href={`/${locale}/analytics/`} className="hover:text-[var(--accent-blue)] transition-colors">
              Analytics
            </Link>
            <ChevronRight size={12} />
            <span className="text-[var(--text-secondary)]">{breadcrumb}</span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <DashboardDateRangePicker preset={datePreset} onPresetChange={setDatePreset} />
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

      {tabs ? (
        <Tabs defaultValue={tabs[0]?.value}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        children
      )}

      <ExportModal open={isExportOpen} onOpenChange={setIsExportOpen} />
    </div>
  );
}
