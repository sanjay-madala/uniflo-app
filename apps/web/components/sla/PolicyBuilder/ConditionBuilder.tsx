"use client";

import { Button } from "@uniflo/ui";
import { Plus } from "lucide-react";
import type { SLACondition, SLAModule } from "@uniflo/mock-data";
import { ConditionRow } from "./ConditionRow";

interface ConditionBuilderProps {
  conditions: SLACondition[];
  conditionLogic: "AND" | "OR";
  module: SLAModule;
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<SLACondition>) => void;
  onRemove: (id: string) => void;
  onLogicChange: (logic: "AND" | "OR") => void;
}

export function ConditionBuilder({
  conditions,
  conditionLogic,
  module,
  onAdd,
  onUpdate,
  onRemove,
  onLogicChange,
}: ConditionBuilderProps) {
  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Conditions
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Which items does this policy apply to?
          </p>
        </div>
        {conditions.length > 1 && (
          <div className="flex rounded-md border border-[var(--border-default)] overflow-hidden">
            <button
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: conditionLogic === "AND" ? "var(--accent-blue)" : "transparent",
                color: conditionLogic === "AND" ? "#fff" : "var(--text-secondary)",
              }}
              onClick={() => onLogicChange("AND")}
            >
              ALL
            </button>
            <button
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={{
                backgroundColor: conditionLogic === "OR" ? "var(--accent-blue)" : "transparent",
                color: conditionLogic === "OR" ? "#fff" : "var(--text-secondary)",
              }}
              onClick={() => onLogicChange("OR")}
            >
              ANY
            </button>
          </div>
        )}
      </div>

      {conditions.length === 0 && (
        <p className="mb-3 text-xs text-[var(--text-muted)]">
          No conditions set. This policy applies to ALL items in the selected
          module.
        </p>
      )}

      <div className="space-y-2">
        {conditions.map((condition) => (
          <ConditionRow
            key={condition.id}
            condition={condition}
            module={module}
            onUpdate={(updates) => onUpdate(condition.id, updates)}
            onRemove={() => onRemove(condition.id)}
          />
        ))}
      </div>

      {conditions.length < 5 && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" /> Add condition
        </Button>
      )}
    </div>
  );
}
