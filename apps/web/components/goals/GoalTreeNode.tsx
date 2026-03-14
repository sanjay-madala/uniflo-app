"use client";

import { ChevronRight, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { Goal } from "@uniflo/mock-data";
import {
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@uniflo/ui";
import { GoalProgressRing } from "./GoalProgressRing";
import { GoalStatusChip } from "./GoalStatusChip";
import { GoalOwnerAvatar } from "./GoalOwnerAvatar";
import { KeyResultRow } from "./KeyResultRow";

interface GoalTreeNodeProps {
  goal: Goal;
  locale: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onKRClick?: (krId: string) => void;
}

export function GoalTreeNode({
  goal,
  locale,
  expanded,
  onToggleExpand,
  onKRClick,
}: GoalTreeNodeProps) {
  const autoKRCount = goal.key_results.filter((kr) => kr.tracking_type === "auto").length;
  const manualKRCount = goal.key_results.length - autoKRCount;

  const krCountLabel =
    autoKRCount > 0
      ? `${goal.key_results.length} KRs (${autoKRCount} auto)`
      : `${goal.key_results.length} KRs`;

  return (
    <div role="treeitem" aria-expanded={expanded}>
      {/* Objective Row */}
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 hover:bg-[var(--bg-tertiary)] transition-colors">
        {/* Expand / Collapse */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="shrink-0 p-1 rounded hover:bg-[var(--bg-tertiary)] transition-transform duration-200"
          aria-label={expanded ? "Collapse key results" : "Expand key results"}
        >
          <ChevronRight
            className={`h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
        </button>

        {/* Progress Ring */}
        <GoalProgressRing
          progress={goal.progress_pct}
          health={goal.health}
          size={48}
          strokeWidth={5}
          className="shrink-0"
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/${locale}/goals/${goal.id}`}
            className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors line-clamp-1"
            title={goal.title}
          >
            {goal.title}
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <GoalStatusChip health={goal.health} />
            <GoalOwnerAvatar name={goal.owner_name} showName />
            {goal.team_name && (
              <Badge>{goal.team_name}</Badge>
            )}
            <span className="text-xs text-[var(--text-muted)]">{goal.timeframe_label}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="default">{krCountLabel}</Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
                aria-label="Goal actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/goals/${goal.id}`}>View Detail</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Results (expanded) */}
      {expanded && (
        <div className="ms-10 mt-2 flex flex-col gap-2 border-s-2 border-[var(--border-default)] ps-4">
          {goal.key_results.map((kr) => (
            <KeyResultRow
              key={kr.id}
              kr={kr}
              onClick={() => onKRClick?.(kr.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
