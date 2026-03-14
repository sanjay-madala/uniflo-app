"use client";

import Link from "next/link";
import type { Goal } from "@uniflo/mock-data";
import { Badge } from "@uniflo/ui";
import { GoalProgressRing } from "./GoalProgressRing";
import { GoalStatusChip } from "./GoalStatusChip";

interface GoalCardProps {
  goal: Goal;
  locale: string;
}

export function GoalCard({ goal, locale }: GoalCardProps) {
  const autoKRCount = goal.key_results.filter((kr) => kr.tracking_type === "auto").length;
  const krLabel =
    autoKRCount > 0
      ? `${goal.key_results.length} KRs (${autoKRCount} auto)`
      : `${goal.key_results.length} KRs`;

  return (
    <Link
      href={`/${locale}/goals/${goal.id}`}
      className="block rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--accent-blue)]/50 hover:bg-[var(--bg-tertiary)] transition-colors"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <GoalProgressRing
          progress={goal.progress_pct}
          health={goal.health}
          size={64}
          strokeWidth={6}
        />

        <h3
          className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 min-h-[2.5rem]"
          title={goal.title}
        >
          {goal.title}
        </h3>

        <GoalStatusChip health={goal.health} />

        <Badge variant="default">{krLabel}</Badge>

        <span className="text-xs text-[var(--text-muted)]">{goal.timeframe_label}</span>

        <span className="text-xs font-medium text-[var(--accent-blue)]">
          View Detail &rarr;
        </span>
      </div>
    </Link>
  );
}
