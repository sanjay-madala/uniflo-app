"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tasks as allTasks, users, projects } from "@uniflo/mock-data";
import type { Task, User, Project } from "@uniflo/mock-data";
import { PageHeader, Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { TaskStatusChip } from "@/components/tasks/TaskStatusChip";
import { TaskPriorityBadge } from "@/components/tasks/TaskPriorityBadge";
import { SubtaskProgressBar } from "@/components/tasks/SubtaskProgressBar";
import { TaskProgressSummary } from "@/components/tasks/TaskProgressSummary";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

const NOW = new Date("2026-03-14T12:00:00Z");
const CURRENT_USER_ID = "usr_002"; // Simulated logged-in user (Marcus Johnson - manager)

function getUserName(id: string | null): string {
  if (!id) return "";
  return (users as User[]).find(u => u.id === id)?.name ?? "";
}

function getProject(projectId: string | null | undefined): Project | null {
  if (!projectId) return null;
  return (projects as Project[]).find(p => p.id === projectId) ?? null;
}

function isOverdue(task: Task): boolean {
  return task.status !== "done" && task.status !== "cancelled" && new Date(task.due_date) < NOW;
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TaskGroup {
  projectId: string | null;
  projectName: string;
  projectColor: string | null;
  tasks: Task[];
}

export default function MyTasksPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const tasks = allTasks as Task[];

  // Get only current user's tasks
  const myTasks = useMemo(() => {
    return tasks.filter(t => t.assignee_id === CURRENT_USER_ID);
  }, [tasks]);

  // Apply filters
  const filtered = useMemo(() => {
    let result = [...myTasks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter(t => t.priority === priorityFilter);
    if (dateFilter !== "all") {
      if (dateFilter === "overdue") {
        result = result.filter(t => isOverdue(t));
      } else {
        const days = parseInt(dateFilter, 10);
        const cutoff = new Date(NOW.getTime() + days * 86400000);
        result = result.filter(t => new Date(t.due_date) <= cutoff);
      }
    }

    // Sort by due date ascending
    result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    return result;
  }, [myTasks, search, statusFilter, priorityFilter, dateFilter]);

  // Group by project
  const groups = useMemo<TaskGroup[]>(() => {
    const projectMap = new Map<string, TaskGroup>();

    for (const task of filtered) {
      const key = task.project_id ?? "__none__";
      if (!projectMap.has(key)) {
        const proj = getProject(task.project_id);
        projectMap.set(key, {
          projectId: task.project_id ?? null,
          projectName: proj?.name ?? "No Project",
          projectColor: proj?.color ?? null,
          tasks: [],
        });
      }
      projectMap.get(key)!.tasks.push(task);
    }

    // Sort: projects with tasks first, then "No Project"
    const entries = Array.from(projectMap.values());
    entries.sort((a, b) => {
      if (a.projectId === null) return 1;
      if (b.projectId === null) return -1;
      return a.projectName.localeCompare(b.projectName);
    });

    return entries;
  }, [filtered]);

  function toggleGroup(key: string) {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="My Tasks"
        subtitle="Your assigned tasks across projects"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        }
        className="px-0 py-0 border-0"
      />

      <TaskProgressSummary tasks={myTasks} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Due Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="7">Due in 7 days</SelectItem>
            <SelectItem value="30">Due in 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grouped task list */}
      <div className="space-y-4">
        {groups.map(group => {
          const key = group.projectId ?? "__none__";
          const isCollapsed = collapsedGroups[key] ?? false;

          return (
            <section
              key={key}
              className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] overflow-hidden"
            >
              {/* Group header */}
              <button
                onClick={() => toggleGroup(key)}
                className="flex w-full items-center gap-2 px-4 py-3 hover:bg-[var(--bg-tertiary)]/50 transition-colors"
              >
                {isCollapsed
                  ? <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                  : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                }
                {group.projectColor && (
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: group.projectColor }}
                  />
                )}
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {group.projectName}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  ({group.tasks.length})
                </span>
              </button>

              {/* Tasks */}
              {!isCollapsed && (
                <div className="border-t border-[var(--border-default)]">
                  {group.tasks.map(task => {
                    const overdue = isOverdue(task);

                    return (
                      <Link
                        key={task.id}
                        href={`/${locale}/tasks/${task.id}/`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)]/50 transition-colors border-b border-[var(--border-default)] last:border-b-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-primary)] truncate">
                              {task.title}
                            </span>
                          </div>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-1 max-w-[200px] ms-0">
                              <SubtaskProgressBar subtasks={task.subtasks} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <TaskPriorityBadge priority={task.priority} />
                          <TaskStatusChip status={task.status} />
                          <span className={`text-xs ${
                            overdue
                              ? "font-medium text-[var(--accent-red,#F85149)]"
                              : "text-[var(--text-muted)]"
                          }`}>
                            {overdue && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-red,#F85149)] me-1 animate-pulse" />}
                            {formatShortDate(task.due_date)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {groups.length === 0 && (
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">No tasks match your filters.</p>
          </div>
        )}
      </div>

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
