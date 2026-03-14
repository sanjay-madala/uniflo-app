"use client";

import type { BroadcastTemplate } from "@uniflo/mock-data";
import { Badge, Button } from "@uniflo/ui";
import { Eye } from "lucide-react";

const categoryLabels: Record<string, string> = {
  policy_update: "Policy Update",
  safety_alert: "Safety Alert",
  operational_change: "Operational",
  event_announcement: "Event",
  training_reminder: "Training",
  compliance_notice: "Compliance",
  general: "General",
};

interface TemplateCardProps {
  template: BroadcastTemplate;
  onPreview: () => void;
  onUse: () => void;
}

export function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden hover:shadow-lg hover:border-[var(--accent-blue)] transition-all">
      {/* Accent bar */}
      <div className="h-1" style={{ backgroundColor: template.thumbnail_color }} />

      <div className="flex flex-col gap-3 p-4">
        {/* Name */}
        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">
          {template.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem]">
          {template.description}
        </p>

        {/* Category + system badge */}
        <div className="flex items-center gap-2">
          <Badge>{categoryLabels[template.category] ?? template.category}</Badge>
          {template.is_system && (
            <Badge variant="blue">Built-in</Badge>
          )}
        </div>

        {/* Usage count */}
        <p className="text-xs text-[var(--text-muted)]">
          Used {template.usage_count} time{template.usage_count !== 1 ? "s" : ""}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-default)]">
          <Button variant="ghost" size="sm" onClick={onPreview} className="flex-1">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
          <Button size="sm" onClick={onUse} className="flex-1">
            Use Template
          </Button>
        </div>
      </div>
    </div>
  );
}
