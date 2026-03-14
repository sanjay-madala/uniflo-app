"use client";

interface AuditProgressBarProps {
  completedItems: number;
  totalItems: number;
  currentSection: string;
  sectionIndex: number;
  totalSections: number;
}

export function AuditProgressBar({
  completedItems,
  totalItems,
  currentSection,
  sectionIndex,
  totalSections,
}: AuditProgressBarProps) {
  const percent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4"
      role="progressbar"
      aria-valuenow={completedItems}
      aria-valuemin={0}
      aria-valuemax={totalItems}
      aria-label={`${completedItems} of ${totalItems} items completed`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {completedItems}/{totalItems} items
        </span>
        <span className="text-xs text-[var(--text-muted)]">
          {Math.round(percent)}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
        <div
          className="h-2 rounded-full bg-[var(--accent-blue)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--text-secondary)]">
        Section {sectionIndex + 1} of {totalSections}: {currentSection}
      </p>
    </div>
  );
}
