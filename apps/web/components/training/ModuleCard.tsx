"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@uniflo/ui";
import type { TrainingModule, TrainingEnrollment } from "@uniflo/mock-data";
import { Clock, Users } from "lucide-react";
import { DifficultyBadge } from "./DifficultyBadge";
import { ModuleStatusBadge } from "./ModuleStatusBadge";
import { CompletionRateBar } from "./CompletionRateBar";
import { LinkedSOPChip } from "./LinkedSOPChip";

const categoryColors: Record<string, string> = {
  safety: "var(--accent-red)",
  operations: "var(--accent-blue)",
  compliance: "var(--accent-purple)",
  customer_service: "var(--accent-pink)",
  onboarding: "var(--accent-green)",
  leadership: "var(--accent-yellow)",
};

const categoryLabels: Record<string, string> = {
  safety: "Safety",
  operations: "Operations",
  compliance: "Compliance",
  customer_service: "Customer Service",
  onboarding: "Onboarding",
  leadership: "Leadership",
};

interface ModuleCardProps {
  module: TrainingModule;
  enrollment?: TrainingEnrollment;
  compact?: boolean;
}

export function ModuleCard({ module, enrollment, compact = false }: ModuleCardProps) {
  const { locale } = useParams<{ locale: string }>();
  const catColor = categoryColors[module.category] ?? "var(--text-muted)";

  return (
    <Link href={`/${locale}/training/${module.id}/`}>
      <Card className="cursor-pointer transition-all hover:shadow-md hover:border-[var(--accent-blue)]/30 h-full flex flex-col overflow-hidden">
        {/* Cover image / gradient area */}
        <div
          className={`relative w-full ${compact ? "h-28" : "h-[200px]"}`}
          style={{
            background: module.cover_image
              ? `url(${module.cover_image}) center/cover`
              : `linear-gradient(135deg, ${catColor}30, ${catColor}10)`,
          }}
        >
          <div className="absolute top-3 left-3">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium"
              style={{
                backgroundColor: `${catColor}20`,
                color: catColor,
                border: `1px solid ${catColor}40`,
              }}
            >
              {categoryLabels[module.category] ?? module.category}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <DifficultyBadge difficulty={module.difficulty} />
          </div>
        </div>

        <div className={`flex flex-col gap-2 ${compact ? "p-3" : "p-4"} flex-1`}>
          {/* Title */}
          <h3
            className={`font-semibold text-[var(--text-primary)] line-clamp-2 ${compact ? "text-xs" : "text-sm"}`}
          >
            {module.title}
          </h3>

          {/* Description */}
          {!compact && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 flex-1">
              {module.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {module.estimated_duration_minutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {module.total_completed}/{module.total_enrolled}
            </span>
          </div>

          {/* Progress bar (if enrolled) */}
          {enrollment && (
            <CompletionRateBar rate={enrollment.progress_percent} />
          )}

          {/* Footer */}
          {!compact && (
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-default)]">
              <div className="min-w-0">
                {module.linked_sop_id && module.linked_sop_title && (
                  <LinkedSOPChip
                    sopId={module.linked_sop_id}
                    sopTitle={module.linked_sop_title}
                    sopVersion={module.linked_sop_version}
                  />
                )}
              </div>
              <ModuleStatusBadge status={module.status} />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
