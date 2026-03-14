"use client";

import { Button } from "@uniflo/ui";
import { Plus } from "lucide-react";
import type { SLATarget, SLAMetricType, SLAModule } from "@uniflo/mock-data";
import { TargetRow } from "./TargetRow";

interface TargetBuilderProps {
  targets: SLATarget[];
  module: SLAModule;
  onAdd: (metric: SLAMetricType) => void;
  onUpdate: (id: string, updates: Partial<SLATarget>) => void;
  onRemove: (id: string) => void;
  error?: string;
}

const metricsByModule: Record<SLAModule, { value: SLAMetricType; label: string }[]> = {
  tickets: [
    { value: "first_response", label: "First Response" },
    { value: "resolution", label: "Resolution" },
    { value: "update_interval", label: "Update Interval" },
  ],
  audits: [{ value: "completion", label: "Completion" }],
  capa: [
    { value: "resolution", label: "Resolution" },
    { value: "update_interval", label: "Update Interval" },
  ],
};

export function TargetBuilder({
  targets,
  module,
  onAdd,
  onUpdate,
  onRemove,
  error,
}: TargetBuilderProps) {
  const available = metricsByModule[module] ?? [];
  const usedMetrics = new Set(targets.map((t) => t.metric));
  const remaining = available.filter((m) => !usedMetrics.has(m.value));

  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Targets <span className="text-[var(--accent-red)]">*</span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Define time targets for this policy.
        </p>
      </div>

      <div className="space-y-3">
        {targets.map((target) => (
          <TargetRow
            key={target.id}
            target={target}
            onUpdate={(updates) => onUpdate(target.id, updates)}
            onRemove={() => onRemove(target.id)}
            canRemove={targets.length > 1}
          />
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs text-[var(--accent-red)]">{error}</p>
      )}

      {remaining.length > 0 && targets.length < 4 && (
        <div className="mt-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => remaining[0] && onAdd(remaining[0].value)}
          >
            <Plus className="h-4 w-4" /> Add target
          </Button>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Available: {remaining.map((r) => r.label).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
