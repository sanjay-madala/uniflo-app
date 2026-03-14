"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@uniflo/ui";
import { users } from "@uniflo/mock-data";
import type { Project, User } from "@uniflo/mock-data";

interface ProjectCardProps {
  project: Project;
}

const statusConfig: Record<Project["status"], { label: string; variant: "blue" | "success" | "warning" | "default" }> = {
  active: { label: "Active", variant: "blue" },
  completed: { label: "Completed", variant: "success" },
  on_hold: { label: "On Hold", variant: "warning" },
  archived: { label: "Archived", variant: "default" },
};

function getOwnerName(ownerId: string): string {
  const user = (users as User[]).find(u => u.id === ownerId);
  return user?.name ?? "Unknown";
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { locale } = useParams<{ locale: string }>();
  const percent = project.task_count > 0
    ? Math.round((project.completed_task_count / project.task_count) * 100)
    : 0;

  const barColor =
    percent === 100
      ? "bg-[var(--accent-green)]"
      : percent > 0
        ? "bg-[var(--accent-blue)]"
        : "bg-[var(--text-muted)]";

  const status = statusConfig[project.status];

  return (
    <Link
      href={`/${locale}/tasks/projects/${project.id}/`}
      className="block rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--border-strong)] transition-colors"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{project.name}</h3>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3">
          {project.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] mb-1">
          <span>{project.completed_task_count}/{project.task_count} tasks completed</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
          <div
            className={`h-2 rounded-full ${barColor} transition-all duration-300`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--text-muted)]">
          <span>Owner: {getOwnerName(project.owner_id)}</span>
          {project.due_date && project.status !== "completed" && (
            <span className="ms-3">Due: {new Date(project.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          )}
          {project.status === "completed" && (
            <span className="ms-3 text-[var(--accent-green)]">Completed</span>
          )}
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
    </Link>
  );
}
