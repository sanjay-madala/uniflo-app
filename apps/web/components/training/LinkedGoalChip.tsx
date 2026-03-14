"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Target } from "lucide-react";

interface LinkedGoalChipProps {
  goalId: string;
  label?: string;
}

export function LinkedGoalChip({ goalId, label }: LinkedGoalChipProps) {
  const { locale } = useParams<{ locale: string }>();

  return (
    <Link
      href={`/${locale}/goals/${goalId}/`}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border transition-colors hover:border-[var(--accent-blue)]"
      style={{
        borderColor: "var(--border-default)",
        backgroundColor: "var(--bg-secondary)",
        color: "var(--text-primary)",
      }}
    >
      <Target className="h-3 w-3" style={{ color: "var(--accent-blue)" }} />
      <span className="truncate max-w-[160px]">{label ?? goalId}</span>
    </Link>
  );
}
