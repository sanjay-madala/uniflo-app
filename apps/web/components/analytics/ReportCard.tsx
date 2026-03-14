"use client";

import { Card, CardContent, Badge } from "@uniflo/ui";
import { FileText, Table2, FileSpreadsheet, Calendar, Clock } from "lucide-react";
import type { ExportConfig } from "@uniflo/mock-data";

interface ReportCardProps {
  config: ExportConfig;
}

const FORMAT_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  csv: Table2,
  xlsx: FileSpreadsheet,
};

export function ReportCard({ config }: ReportCardProps) {
  const Icon = FORMAT_ICONS[config.format] ?? FileText;

  return (
    <Card className="hover:border-[var(--accent-blue)] transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]">
            <Icon size={20} className="text-[var(--accent-blue)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{config.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{config.format.toUpperCase()}</Badge>
              <span className="text-xs text-[var(--text-muted)]">{config.scope.replace(/_/g, " ")}</span>
            </div>
            {config.scheduled && (
              <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {config.scheduled.frequency}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Next: {new Date(config.scheduled.next_run).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
