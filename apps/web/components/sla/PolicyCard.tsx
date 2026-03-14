"use client";

import type { SLAPolicy } from "@uniflo/mock-data";
import { Switch } from "@uniflo/ui";
import { PolicyStatusBadge } from "./PolicyStatusBadge";
import { PolicyModuleBadge } from "./PolicyModuleBadge";

interface PolicyCardProps {
  policy: SLAPolicy;
  onToggle: (policyId: string, enabled: boolean) => void;
  onClick: (policyId: string) => void;
}

function formatConditions(policy: SLAPolicy): string {
  if (policy.conditions.length === 0) return "Applies to all items";
  return policy.conditions
    .map((c) => {
      const val = Array.isArray(c.value) ? c.value.join(", ") : String(c.value);
      return `${c.field} ${c.operator.replace("_", " ")} ${val}`;
    })
    .join(" AND ");
}

function formatTarget(target: { label: string; target_value: number; target_unit: string }): string {
  return `${target.label}: ${target.target_value} ${target.target_unit}`;
}

export function PolicyCard({ policy, onToggle, onClick }: PolicyCardProps) {
  const complianceColor =
    policy.compliance_percent_30d > 90
      ? "var(--accent-green)"
      : policy.compliance_percent_30d >= 70
        ? "var(--accent-yellow)"
        : "var(--accent-red)";

  return (
    <div
      className="group cursor-pointer rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 transition-all hover:border-[var(--border-strong)] hover:shadow-md"
      onClick={() => onClick(policy.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(policy.id);
        }
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Switch
            checked={policy.status === "active"}
            disabled={policy.status === "draft"}
            onCheckedChange={(checked) => onToggle(policy.id, checked)}
            aria-label={`Toggle ${policy.name}`}
          />
        </div>
        <h3 className="flex-1 text-sm font-semibold text-[var(--text-primary)]">
          {policy.name}
        </h3>
        <div className="flex items-center gap-2">
          <PolicyModuleBadge module={policy.module} />
          <PolicyStatusBadge status={policy.status} />
        </div>
      </div>

      {/* Conditions description */}
      <p className="mt-2 text-xs text-[var(--text-secondary)]">
        {formatConditions(policy)}
      </p>

      {/* Divider */}
      <div className="my-3 border-t border-[var(--border-default)]" />

      {/* Targets */}
      <div className="mb-3">
        <p className="mb-1 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Targets
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {policy.targets.map((t) => (
            <span key={t.id} className="text-xs text-[var(--text-secondary)]">
              {formatTarget(t)}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-[var(--border-default)]" />

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
        <span>Items: {policy.items_covered}</span>
        <span>
          Breaches (30d):{" "}
          <span className={policy.breach_count_30d > 0 ? "text-[var(--accent-red)] font-medium" : ""}>
            {policy.breach_count_30d}
          </span>
        </span>
        <span>Compliance: {policy.compliance_percent_30d.toFixed(1)}%</span>
      </div>

      {/* Compliance bar */}
      {policy.items_covered > 0 && (
        <div className="mt-2">
          <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)]">
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(policy.compliance_percent_30d, 100)}%`,
                backgroundColor: complianceColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
