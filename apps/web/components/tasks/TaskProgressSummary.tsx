"use client";

import type { Task } from "@uniflo/mock-data";

interface TaskProgressSummaryProps {
  tasks: Task[];
}

const statusColors: Record<string, string> = {
  todo: "bg-[var(--text-muted)]",
  in_progress: "bg-[var(--accent-blue)]",
  in_review: "bg-purple-500",
  done: "bg-[var(--accent-green)]",
  cancelled: "bg-[var(--accent-red)]",
};

const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  cancelled: "Cancelled",
};

export function TaskProgressSummary({ tasks }: TaskProgressSummaryProps) {
  const counts: Record<string, number> = {
    todo: 0,
    in_progress: 0,
    in_review: 0,
    done: 0,
    cancelled: 0,
  };

  for (const t of tasks) {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  }

  const displayStatuses = ["todo", "in_progress", "in_review", "done"];

  return (
    <div className="flex items-center gap-4 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex flex-wrap items-center gap-4">
        {displayStatuses.map(status => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${statusColors[status]}`} />
            <span className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">{counts[status]}</span>
              {" "}{statusLabels[status]}
            </span>
          </div>
        ))}
      </div>
      <div className="ms-auto text-sm text-[var(--text-muted)]">
        Total: {tasks.length}
      </div>
    </div>
  );
}
