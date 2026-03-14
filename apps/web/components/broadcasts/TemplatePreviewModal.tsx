"use client";

import type { BroadcastTemplate } from "@uniflo/mock-data";
import { Modal, Badge, Button } from "@uniflo/ui";

const categoryLabels: Record<string, string> = {
  policy_update: "Policy Update",
  safety_alert: "Safety Alert",
  operational_change: "Operational",
  event_announcement: "Event",
  training_reminder: "Training",
  compliance_notice: "Compliance",
  general: "General",
};

interface TemplatePreviewModalProps {
  template: BroadcastTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: BroadcastTemplate) => void;
}

export function TemplatePreviewModal({ template, open, onOpenChange, onUse }: TemplatePreviewModalProps) {
  if (!template) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title={template.name}
      footer={
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onUse(template)}>Use This Template</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge>{categoryLabels[template.category] ?? template.category}</Badge>
          {template.is_system && <Badge variant="blue">Built-in</Badge>}
        </div>

        <div
          className="prose prose-sm max-w-none rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-4 text-[var(--text-primary)]"
          dangerouslySetInnerHTML={{ __html: template.body_html }}
        />

        <div className="grid grid-cols-2 gap-4 text-xs text-[var(--text-muted)]">
          <div>
            <span className="font-medium text-[var(--text-secondary)]">Default Priority:</span>{" "}
            {template.priority_default}
          </div>
          <div>
            <span className="font-medium text-[var(--text-secondary)]">Acknowledgment:</span>{" "}
            {template.acknowledgment_default ? "Required" : "Optional"}
          </div>
          <div>
            <span className="font-medium text-[var(--text-secondary)]">Used:</span>{" "}
            {template.usage_count} times
          </div>
          <div>
            <span className="font-medium text-[var(--text-secondary)]">Last updated:</span>{" "}
            {new Date(template.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
