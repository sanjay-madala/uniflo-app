"use client";

import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Input } from "@uniflo/ui";
import { X } from "lucide-react";
import type { RuleCondition, ConditionField, ConditionOperator } from "@uniflo/mock-data";

// Available fields per trigger module
const fieldsByModule: Record<string, Array<{ value: ConditionField; label: string; type: "number" | "select" | "text" }>> = {
  audits: [
    { value: "score", label: "Score", type: "number" },
    { value: "location", label: "Location", type: "select" },
    { value: "category", label: "Category", type: "select" },
  ],
  tickets: [
    { value: "priority", label: "Priority", type: "select" },
    { value: "status", label: "Status", type: "select" },
    { value: "category", label: "Category", type: "select" },
    { value: "assignee", label: "Assignee", type: "select" },
    { value: "tags_include", label: "Tags", type: "text" },
    { value: "location", label: "Location", type: "select" },
  ],
  capa: [
    { value: "severity", label: "Severity", type: "select" },
    { value: "status", label: "Status", type: "select" },
    { value: "category", label: "Source", type: "select" },
    { value: "assignee", label: "Owner", type: "select" },
  ],
  tasks: [
    { value: "priority", label: "Priority", type: "select" },
    { value: "assignee", label: "Assignee", type: "select" },
    { value: "due_date_days", label: "Days Overdue", type: "number" },
  ],
  sops: [
    { value: "category", label: "Category", type: "select" },
    { value: "location", label: "Location", type: "select" },
  ],
  sla: [
    { value: "priority", label: "Priority", type: "select" },
    { value: "category", label: "Breach Type", type: "select" },
  ],
};

const operatorsByFieldType: Record<string, Array<{ value: ConditionOperator; label: string }>> = {
  number: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "greater_than", label: "greater than" },
    { value: "less_than", label: "less than" },
  ],
  select: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
  text: [
    { value: "equals", label: "equals" },
    { value: "not_equals", label: "not equals" },
    { value: "contains", label: "contains" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
  ],
};

// Select options for specific fields
const selectOptions: Record<string, Array<{ value: string; label: string }>> = {
  priority: [
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ],
  severity: [
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ],
  status: [
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ],
  category: [
    { value: "fb", label: "F&B" },
    { value: "housekeeping", label: "Housekeeping" },
    { value: "maintenance", label: "Maintenance" },
    { value: "compliance", label: "Compliance" },
    { value: "guest_relations", label: "Guest Relations" },
  ],
  location: [
    { value: "loc_001", label: "Downtown" },
    { value: "loc_002", label: "Airport" },
    { value: "loc_003", label: "Resort" },
  ],
  assignee: [
    { value: "usr_001", label: "Sarah Chen" },
    { value: "usr_002", label: "Marcus Johnson" },
    { value: "usr_003", label: "Priya Sharma" },
    { value: "usr_004", label: "Tom Riley" },
    { value: "usr_005", label: "Ana Kowalski" },
  ],
};

interface ConditionBlockProps {
  condition: RuleCondition;
  module: string;
  onUpdate: (updates: Partial<RuleCondition>) => void;
  onRemove: () => void;
  errors?: Record<string, string>;
}

export function ConditionBlock({ condition, module, onUpdate, onRemove, errors }: ConditionBlockProps) {
  const fields = fieldsByModule[module] ?? fieldsByModule.tickets;
  const selectedField = fields.find(f => f.value === condition.field);
  const fieldType = selectedField?.type ?? "text";
  const operators = operatorsByFieldType[fieldType] ?? operatorsByFieldType.text;
  const needsValue = condition.operator !== "is_empty" && condition.operator !== "is_not_empty";

  function renderValueInput() {
    if (!needsValue) return null;

    if (fieldType === "number") {
      return (
        <Input
          type="number"
          value={String(condition.value)}
          onChange={e => onUpdate({ value: Number(e.target.value) })}
          className={`flex-1 min-w-[80px] ${errors?.value ? "border-[var(--accent-red)]" : ""}`}
          placeholder="Value"
        />
      );
    }

    if (fieldType === "select" && selectOptions[condition.field]) {
      return (
        <Select
          value={String(condition.value)}
          onValueChange={v => onUpdate({ value: v })}
        >
          <SelectTrigger className={`flex-1 min-w-[120px] ${errors?.value ? "border-[var(--accent-red)]" : ""}`}>
            <SelectValue placeholder="Value" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions[condition.field]?.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        value={String(condition.value)}
        onChange={e => onUpdate({ value: e.target.value })}
        className={`flex-1 min-w-[120px] ${errors?.value ? "border-[var(--accent-red)]" : ""}`}
        placeholder="Value"
      />
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Field */}
      <Select value={condition.field} onValueChange={v => onUpdate({ field: v as ConditionField, value: "" })}>
        <SelectTrigger className={`w-[160px] ${errors?.field ? "border-[var(--accent-red)]" : ""}`}>
          <SelectValue placeholder="Field" />
        </SelectTrigger>
        <SelectContent>
          {fields.map(f => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator */}
      <Select value={condition.operator} onValueChange={v => onUpdate({ operator: v as ConditionOperator })}>
        <SelectTrigger className={`w-[140px] ${errors?.operator ? "border-[var(--accent-red)]" : ""}`}>
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          {operators.map(op => (
            <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value */}
      {renderValueInput()}

      {/* Delete */}
      <button
        onClick={onRemove}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
        aria-label="Remove condition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
