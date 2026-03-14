"use client";

interface AuditScoreBadgeProps {
  score: number | null;
  pass: boolean | null;
  threshold?: number;
}

export function AuditScoreBadge({ score, pass, threshold = 80 }: AuditScoreBadgeProps) {
  if (score === null) {
    return <span className="text-sm text-[var(--text-muted)]">&mdash;</span>;
  }

  const isPassing = pass ?? score >= threshold;
  const color = isPassing ? "var(--accent-green)" : "var(--accent-red)";

  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-semibold"
      style={{ color }}
    >
      {score}%
    </span>
  );
}
