"use client";

import { Badge, Button, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Checkbox } from "@uniflo/ui";
import type { SOPStep, SOPStepType } from "@uniflo/mock-data";
import { StepTypeIcon, getStepTypeLabel } from "./StepTypeIcon";
import { GripVertical, Trash2, Plus, X } from "lucide-react";

interface SOPStepEditorProps {
  step: SOPStep;
  stepNumber: number;
  totalSteps: number;
  isActive: boolean;
  onUpdate: (step: SOPStep) => void;
  onDelete: () => void;
  onFocus: () => void;
}

const stepTypes: SOPStepType[] = ["instruction", "checklist", "decision", "warning", "reference"];

export function SOPStepEditor({
  step,
  stepNumber,
  totalSteps,
  isActive,
  onUpdate,
  onDelete,
  onFocus,
}: SOPStepEditorProps) {
  function updateField<K extends keyof SOPStep>(key: K, value: SOPStep[K]) {
    onUpdate({ ...step, [key]: value });
  }

  function addChecklistItem() {
    const items = [...(step.checklist_items ?? []), ""];
    onUpdate({ ...step, checklist_items: items });
  }

  function updateChecklistItem(index: number, value: string) {
    const items = [...(step.checklist_items ?? [])];
    items[index] = value;
    onUpdate({ ...step, checklist_items: items });
  }

  function removeChecklistItem(index: number) {
    const items = (step.checklist_items ?? []).filter((_, i) => i !== index);
    onUpdate({ ...step, checklist_items: items });
  }

  function addBranch() {
    const branches = [...(step.decision_branches ?? []), { label: "", goto_step_id: "" }];
    onUpdate({ ...step, decision_branches: branches });
  }

  function updateBranch(index: number, field: "label" | "goto_step_id", value: string) {
    const branches = [...(step.decision_branches ?? [])];
    branches[index] = { ...branches[index], [field]: value };
    onUpdate({ ...step, decision_branches: branches });
  }

  function removeBranch(index: number) {
    const branches = (step.decision_branches ?? []).filter((_, i) => i !== index);
    onUpdate({ ...step, decision_branches: branches });
  }

  return (
    <div
      className={`rounded-lg border bg-[var(--bg-secondary)] transition-all ${
        isActive
          ? "border-[var(--accent-blue)] ring-1 ring-[var(--accent-blue)]/20"
          : "border-[var(--border-default)]"
      }`}
      onClick={onFocus}
    >
      {/* Drag handle + header */}
      <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-3 py-2">
        <div className="cursor-grab text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
          <GripVertical className="h-4 w-4" />
        </div>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-blue)]/10 text-[10px] font-semibold text-[var(--accent-blue)]">
          {stepNumber}
        </span>
        <Input
          value={step.title}
          onChange={e => updateField("title", e.target.value)}
          placeholder="Step title..."
          className="flex-1 border-0 bg-transparent text-sm font-medium focus:ring-0 px-1"
        />
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] shrink-0">
          <Checkbox
            checked={step.required}
            onCheckedChange={(checked) => updateField("required", checked === true)}
          />
          Required
        </label>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Step type select */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Type:</span>
          <Select value={step.type} onValueChange={(v: string) => updateField("type", v as SOPStepType)}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <div className="flex items-center gap-1.5">
                <StepTypeIcon type={step.type} className="h-3 w-3" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {stepTypes.map(t => (
                <SelectItem key={t} value={t}>
                  <div className="flex items-center gap-1.5">
                    <StepTypeIcon type={t} className="h-3 w-3" />
                    {getStepTypeLabel(t)}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <Textarea
          value={step.description.replace(/<[^>]*>/g, "")}
          onChange={e => updateField("description", `<p>${e.target.value}</p>`)}
          placeholder="Step content..."
          rows={3}
          className="text-sm"
        />

        {/* Checklist items (for checklist type) */}
        {step.type === "checklist" && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Checklist Items</span>
            {(step.checklist_items ?? []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Checkbox checked={false} disabled />
                <Input
                  value={item}
                  onChange={e => updateChecklistItem(idx, e.target.value)}
                  placeholder={`Item ${idx + 1}`}
                  className="flex-1 h-8 text-sm"
                />
                <button onClick={() => removeChecklistItem(idx)} className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addChecklistItem} className="text-xs">
              <Plus className="h-3 w-3" /> Add Item
            </Button>
          </div>
        )}

        {/* Decision branches (for decision type) */}
        {step.type === "decision" && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Decision Branches</span>
            {(step.decision_branches ?? []).map((branch, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={branch.label}
                  onChange={e => updateBranch(idx, "label", e.target.value)}
                  placeholder="Branch label (e.g. Yes)"
                  className="flex-1 h-8 text-sm"
                />
                <Input
                  value={branch.goto_step_id}
                  onChange={e => updateBranch(idx, "goto_step_id", e.target.value)}
                  placeholder="Go to step ID"
                  className="w-36 h-8 text-sm"
                />
                <button onClick={() => removeBranch(idx)} className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addBranch} className="text-xs">
              <Plus className="h-3 w-3" /> Add Branch
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--border-default)]">
          <Button variant="ghost" size="sm" className="text-xs text-[var(--text-muted)]">
            <Plus className="h-3 w-3" /> Add Attachment
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="text-xs text-[var(--accent-red)] hover:text-[var(--accent-red)]">
            <Trash2 className="h-3 w-3" /> Delete Step
          </Button>
        </div>
      </div>
    </div>
  );
}
