"use client";

import { Target } from "lucide-react";
import { EmptyState } from "@uniflo/ui";

interface GoalEmptyStateProps {
  onCreateGoal?: () => void;
}

export function GoalEmptyState({ onCreateGoal }: GoalEmptyStateProps) {
  return (
    <EmptyState
      icon={<Target className="h-6 w-6" />}
      title="No goals yet"
      description="Create your first objective and link it to your operational data."
      action={
        onCreateGoal
          ? { label: "Create Goal", onClick: onCreateGoal }
          : undefined
      }
    />
  );
}
