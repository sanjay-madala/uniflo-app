"use client";

import { useState } from "react";
import { PageHeader, Button } from "@uniflo/ui";
import { Plus } from "lucide-react";
import { exportConfigs } from "@uniflo/mock-data";
import { ReportCard } from "@/components/analytics/ReportCard";
import { ExportModal } from "@/components/analytics/ExportModal";

export default function ReportsPage() {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Saved Reports"
        subtitle="Manage your scheduled and saved report configurations"
        actions={
          <Button size="sm" onClick={() => setIsExportOpen(true)}>
            <Plus className="h-4 w-4" />
            New Report
          </Button>
        }
        className="px-0 py-0 border-0"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exportConfigs.map((config) => (
          <ReportCard key={config.id} config={config} />
        ))}
      </div>

      <ExportModal open={isExportOpen} onOpenChange={setIsExportOpen} />
    </div>
  );
}
