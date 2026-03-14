"use client";

import { Badge } from "@uniflo/ui";
import type { TrainingDifficulty } from "@uniflo/mock-data";

const difficultyConfig: Record<TrainingDifficulty, { label: string; variant: "success" | "blue" | "warning" }> = {
  beginner: { label: "Beginner", variant: "success" },
  intermediate: { label: "Intermediate", variant: "blue" },
  advanced: { label: "Advanced", variant: "warning" },
};

interface DifficultyBadgeProps {
  difficulty: TrainingDifficulty;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
