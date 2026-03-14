"use client";

import { useState } from "react";
import type { SOPStep } from "@uniflo/mock-data";
import { SOPStepEditor } from "./SOPStepEditor";
import { Button, EmptyState } from "@uniflo/ui";
import { Plus, ListOrdered } from "lucide-react";

interface SOPStepListProps {
  steps: SOPStep[];
  onStepsChange: (steps: SOPStep[]) => void;
}

export function SOPStepList({ steps, onStepsChange }: SOPStepListProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  function updateStep(index: number, updated: SOPStep) {
    const next = [...steps];
    next[index] = updated;
    onStepsChange(next);
  }

  function deleteStep(index: number) {
    const next = steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    onStepsChange(next);
    setActiveStepId(null);
  }

  function addStep() {
    const newStep: SOPStep = {
      id: `step_new_${Date.now()}`,
      order: steps.length + 1,
      title: "",
      description: "",
      type: "instruction",
      required: true,
    };
    onStepsChange([...steps, newStep]);
    setActiveStepId(newStep.id);
  }

  function moveStep(fromIndex: number, direction: "up" | "down") {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= steps.length) return;
    const next = [...steps];
    [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
    onStepsChange(next.map((s, i) => ({ ...s, order: i + 1 })));
  }

  if (steps.length === 0) {
    return (
      <EmptyState
        icon={<ListOrdered className="h-6 w-6" />}
        title="No steps yet"
        description="Add your first step to start building this SOP"
        action={{ label: "Add First Step", onClick: addStep }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <SOPStepEditor
          key={step.id}
          step={step}
          stepNumber={index + 1}
          totalSteps={steps.length}
          isActive={activeStepId === step.id}
          onUpdate={(updated) => updateStep(index, updated)}
          onDelete={() => deleteStep(index)}
          onFocus={() => setActiveStepId(step.id)}
        />
      ))}
      <Button variant="secondary" onClick={addStep} className="w-full">
        <Plus className="h-4 w-4" /> Add Step
      </Button>
    </div>
  );
}
