"use client";

import { Card, CardContent, Button } from "@uniflo/ui";
import { Plus } from "lucide-react";
import type { RuleCondition } from "@uniflo/mock-data";
import { ConditionBlock } from "./ConditionBlock";

interface ConditionGroupProps {
  conditions: RuleCondition[];
  logic: "AND" | "OR";
  module: string;
  onSetLogic: (logic: "AND" | "OR") => void;
  onAddCondition: () => void;
  onUpdateCondition: (id: string, updates: Partial<RuleCondition>) => void;
  onRemoveCondition: (id: string) => void;
}

export function ConditionGroup({
  conditions,
  logic,
  module,
  onSetLogic,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
}: ConditionGroupProps) {
  const maxConditions = 5;

  return (
    <Card role="region" aria-label="Conditions">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            If <strong>{logic === "AND" ? "all" : "any"}</strong> of these are true:
          </span>

          {/* AND/OR segmented control */}
          <div className="flex rounded-md border border-[var(--border-default)] overflow-hidden">
            <button
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                logic === "AND"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              onClick={() => onSetLogic("AND")}
            >
              ALL
            </button>
            <button
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                logic === "OR"
                  ? "bg-[var(--accent-blue)] text-white"
                  : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              onClick={() => onSetLogic("OR")}
            >
              ANY
            </button>
          </div>
        </div>

        {conditions.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] mb-3">
            No conditions set. This rule will fire on every trigger event.
          </p>
        ) : (
          <div className="space-y-2 mb-3">
            {conditions.map(condition => (
              <ConditionBlock
                key={condition.id}
                condition={condition}
                module={module}
                onUpdate={updates => onUpdateCondition(condition.id, updates)}
                onRemove={() => onRemoveCondition(condition.id)}
              />
            ))}
          </div>
        )}

        {conditions.length < maxConditions && (
          <Button variant="ghost" size="sm" onClick={onAddCondition}>
            <Plus className="h-4 w-4" /> Add condition
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
