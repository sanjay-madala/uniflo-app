"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { GoalLevel, GoalTimeframe, KRTrackingType, KRUnit, KRDirection, KRDataSource } from "@uniflo/mock-data";
import { PageHeader, Button } from "@uniflo/ui";
import { Plus } from "lucide-react";
import { GoalBreadcrumb } from "@/components/goals/GoalBreadcrumb";
import { ObjectiveForm } from "@/components/goals/ObjectiveForm";
import { KeyResultForm } from "@/components/goals/KeyResultForm";
import type { KeyResultFormState } from "@/components/goals/KeyResultForm";

let tempIdCounter = 0;
function createEmptyKR(): KeyResultFormState {
  return {
    tempId: `temp_kr_${++tempIdCounter}`,
    title: "",
    trackingType: "manual" as KRTrackingType,
    unit: "percent" as KRUnit,
    direction: "increase" as KRDirection,
    startValue: "",
    targetValue: "",
    ownerId: "",
  };
}

export default function GoalCreateClient() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<GoalLevel>("team");
  const [ownerId, setOwnerId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("Q1");
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-03-31");
  const [category, setCategory] = useState("");
  const [parentGoalId, setParentGoalId] = useState<string | null>(null);
  const [keyResults, setKeyResults] = useState<KeyResultFormState[]>([createEmptyKR()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleKRChange = useCallback((tempId: string, field: keyof KeyResultFormState, value: string | number) => {
    setKeyResults((prev) =>
      prev.map((kr) =>
        kr.tempId === tempId ? { ...kr, [field]: value } : kr
      )
    );
  }, []);

  const handleAddKR = useCallback(() => {
    setKeyResults((prev) => [...prev, createEmptyKR()]);
  }, []);

  const handleRemoveKR = useCallback((tempId: string) => {
    setKeyResults((prev) => prev.filter((kr) => kr.tempId !== tempId));
  }, []);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!ownerId) newErrors.ownerId = "Owner is required";
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";

    if (keyResults.length === 0) {
      newErrors.keyResults = "At least one key result is required";
    } else {
      for (let i = 0; i < keyResults.length; i++) {
        const kr = keyResults[i];
        if (!kr.title.trim()) newErrors[`kr_${i}_title`] = "KR title is required";
        if (kr.targetValue === "") newErrors[`kr_${i}_target`] = "Target value is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(asDraft: boolean) {
    if (!asDraft && !validate()) return;

    // In a real app, this would post to an API
    router.push(`/${locale}/goals`);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <GoalBreadcrumb locale={locale} crumbs={[{ label: "New Goal" }]} />

      <PageHeader
        title="Create New Goal"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/${locale}/goals`)}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleSubmit(true)}>
              Save as Draft
            </Button>
            <Button size="sm" onClick={() => handleSubmit(false)}>
              Create Goal
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Section 1: Objective Details */}
      <ObjectiveForm
        title={title}
        onTitleChange={setTitle}
        description={description}
        onDescriptionChange={setDescription}
        level={level}
        onLevelChange={setLevel}
        ownerId={ownerId}
        onOwnerIdChange={setOwnerId}
        teamId={teamId}
        onTeamIdChange={setTeamId}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        category={category}
        onCategoryChange={setCategory}
        parentGoalId={parentGoalId}
        onParentGoalIdChange={setParentGoalId}
        errors={errors}
      />

      {/* Section 2: Key Results */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-6">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1 uppercase tracking-wider">
          Key Results
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Define measurable outcomes for this objective
        </p>

        <div className="flex flex-col gap-4">
          {keyResults.map((kr, i) => (
            <KeyResultForm
              key={kr.tempId}
              kr={kr}
              index={i}
              onChange={handleKRChange}
              onRemove={handleRemoveKR}
              canRemove={keyResults.length > 1}
            />
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddKR}
            className="self-start"
          >
            <Plus className="h-4 w-4" /> Add Key Result
          </Button>

          {errors.keyResults && (
            <p className="text-xs text-[var(--accent-red)]">{errors.keyResults}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-[var(--border-default)] pt-4">
        <Button variant="ghost" onClick={() => router.push(`/${locale}/goals`)}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={() => handleSubmit(true)}>
          Save Draft
        </Button>
        <Button onClick={() => handleSubmit(false)}>
          Create Goal
        </Button>
      </div>
    </div>
  );
}
