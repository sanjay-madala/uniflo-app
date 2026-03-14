"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Input,
  Button,
} from "@uniflo/ui";
import { Trash2 } from "lucide-react";
import type { SLACondition, SLAConditionField, SLAModule } from "@uniflo/mock-data";

interface ConditionRowProps {
  condition: SLACondition;
  module: SLAModule;
  onUpdate: (updates: Partial<SLACondition>) => void;
  onRemove: () => void;
}

const fieldsByModule: Record<SLAModule, { value: SLAConditionField; label: string }[]> = {
  tickets: [
    { value: "priority", label: "Priority" },
    { value: "category", label: "Category" },
    { value: "location", label: "Location" },
    { value: "assignee_role", label: "Assignee Role" },
    { value: "tags_include", label: "Tags" },
  ],
  audits: [
    { value: "audit_template", label: "Audit Template" },
    { value: "category", label: "Category" },
    { value: "location", label: "Location" },
  ],
  capa: [
    { value: "severity", label: "Severity" },
    { value: "source", label: "Source" },
    { value: "location", label: "Location" },
  ],
};

const operators = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "is_any", label: "is any of" },
];

export function ConditionRow({
  condition,
  module,
  onUpdate,
  onRemove,
}: ConditionRowProps) {
  const fields = fieldsByModule[module] ?? [];
  const displayValue = Array.isArray(condition.value)
    ? condition.value.join(", ")
    : String(condition.value);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-2">
      <Select
        value={condition.field}
        onValueChange={(v) => onUpdate({ field: v as SLAConditionField })}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Field" />
        </SelectTrigger>
        <SelectContent>
          {fields.map((f) => (
            <SelectItem key={f.value} value={f.value}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={condition.operator}
        onValueChange={(v) =>
          onUpdate({ operator: v as SLACondition["operator"] })
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={displayValue}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Value"
        className="w-36"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={onRemove}
        aria-label="Remove condition"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
