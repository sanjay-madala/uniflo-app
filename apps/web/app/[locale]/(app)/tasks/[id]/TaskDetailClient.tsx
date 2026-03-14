"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tasks as allTasks, users, projects, taskComments as allComments } from "@uniflo/mock-data";
import type { Task, User, Project, Subtask, TaskComment } from "@uniflo/mock-data";
import { Badge, Button, Avatar, AvatarFallback, EmptyState } from "@uniflo/ui";
import { TaskStatusChip } from "@/components/tasks/TaskStatusChip";
import { TaskPriorityBadge } from "@/components/tasks/TaskPriorityBadge";
import { SubtaskTree } from "@/components/tasks/SubtaskTree";
import { CrossModuleLinks } from "@/components/tasks/CrossModuleLinks";
import {
  ArrowLeft,
  UserPlus,
  CheckCircle,
  Shield,
  XCircle,
  Paperclip,
  MessageSquare,
  Clock,
  AlertCircle,
  FileText,
  FolderOpen,
} from "lucide-react";

const NOW = new Date("2026-03-14T12:00:00Z");

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

const sourceLabels: Record<string, { label: string; variant: "blue" | "warning" | "default" | "success" }> = {
  audit: { label: "Audit", variant: "blue" },
  capa: { label: "CAPA", variant: "warning" },
  ticket: { label: "Ticket", variant: "default" },
  manual: { label: "Manual", variant: "default" },
  automation: { label: "Automation", variant: "success" },
};

function getUser(id: string | null | undefined): User | undefined {
  if (!id) return undefined;
  return (users as User[]).find(u => u.id === id);
}

function getProject(projectId: string | null | undefined): Project | undefined {
  if (!projectId) return undefined;
  return (projects as Project[]).find(p => p.id === projectId);
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function computeDueInfo(task: Task): { text: string; overdue: boolean; percent: number } {
  const due = new Date(task.due_date);
  const created = new Date(task.created_at);
  const totalMs = due.getTime() - created.getTime();
  const elapsedMs = NOW.getTime() - created.getTime();

  if (task.status === "done" || task.status === "cancelled") {
    return { text: formatShortDate(task.due_date), overdue: false, percent: 100 };
  }

  if (NOW > due) {
    const overdueMs = NOW.getTime() - due.getTime();
    const days = Math.floor(overdueMs / 86400000);
    const hours = Math.floor((overdueMs % 86400000) / 3600000);
    return { text: `Overdue by ${days}d ${hours}h`, overdue: true, percent: 100 };
  }

  const remainingMs = due.getTime() - NOW.getTime();
  const days = Math.floor(remainingMs / 86400000);
  const hours = Math.floor((remainingMs % 86400000) / 3600000);
  const pct = totalMs > 0 ? Math.min(100, Math.round((elapsedMs / totalMs) * 100)) : 0;

  return { text: `${days}d ${hours}h remaining`, overdue: false, percent: pct };
}

function generateTimeline(task: Task): Array<{ icon: string; text: string; time: string }> {
  const events: Array<{ icon: string; text: string; time: string }> = [];
  const reporter = getUser(task.reporter_id);
  const assignee = getUser(task.assignee_id);
  const created = new Date(task.created_at);

  if (task.source === "audit" && task.linked_audit_id) {
    events.push({
      icon: "audit",
      text: `Task auto-created from audit ${task.linked_audit_id.replace("aud_", "AUD-").toUpperCase()}`,
      time: task.created_at,
    });
  } else {
    events.push({
      icon: "create",
      text: `Task created by ${reporter?.name ?? "System"}`,
      time: task.created_at,
    });
  }

  if (assignee) {
    const t = new Date(created.getTime() + 15 * 60000);
    events.push({ icon: "assign", text: `Assigned to ${assignee.name}`, time: t.toISOString() });
  }

  if (task.status === "in_progress" || task.status === "in_review" || task.status === "done") {
    const t = new Date(created.getTime() + 2 * 3600000);
    events.push({ icon: "status", text: "Status changed to In Progress", time: t.toISOString() });
  }

  if (task.subtasks) {
    const completedSubtasks = task.subtasks.filter(s => s.status === "done" && s.completed_at);
    for (const sub of completedSubtasks) {
      events.push({
        icon: "subtask",
        text: `Subtask completed: "${sub.title}"`,
        time: sub.completed_at!,
      });
    }
  }

  if (task.completed_at) {
    events.push({ icon: "done", text: "Task marked as done", time: task.completed_at });
  }

  return events.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export default function TaskDetailClient() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const [commentText, setCommentText] = useState("");
  const [subtaskState, setSubtaskState] = useState<Subtask[] | null>(null);

  const tasks = allTasks as Task[];
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertCircle className="h-6 w-6" />}
          title="Task not found"
          description={`No task with ID "${id}" exists.`}
          action={{ label: "Back to Tasks", onClick: () => window.history.back() }}
        />
      </div>
    );
  }

  const subtasks = subtaskState ?? task.subtasks ?? [];
  const assignee = getUser(task.assignee_id);
  const reporter = getUser(task.reporter_id);
  const project = getProject(task.project_id);
  const dueInfo = computeDueInfo(task);
  const timeline = generateTimeline(task);
  const comments = (allComments as TaskComment[]).filter(c => c.task_id === task.id);
  const sourceInfo = sourceLabels[task.source];

  const dueBarColor = dueInfo.overdue
    ? "bg-[var(--accent-red,#F85149)]"
    : dueInfo.percent > 75
      ? "bg-[var(--accent-yellow,#EAB308)]"
      : dueInfo.percent > 50
        ? "bg-[var(--accent-yellow,#EAB308)]"
        : "bg-[var(--accent-green,#3FB950)]";

  const taskSubtasksRef = task.subtasks ?? [];

  function handleSubtaskToggle(subtaskId: string) {
    setSubtaskState(prev => {
      const current = prev ?? taskSubtasksRef;
      return current.map(s =>
        s.id === subtaskId
          ? {
              ...s,
              status: s.status === "done" ? "todo" as const : "done" as const,
              completed_at: s.status === "done" ? null : new Date().toISOString(),
            }
          : s
      );
    });
  }

  function handleSubtaskAdd(title: string) {
    setSubtaskState(prev => {
      const current = prev ?? taskSubtasksRef;
      const newSubtask: Subtask = {
        id: `sub_new_${Date.now()}`,
        title,
        status: "todo",
        order: current.length + 1,
      };
      return [...current, newSubtask];
    });
  }

  function handleSubtaskDelete(subtaskId: string) {
    setSubtaskState(prev => {
      const current = prev ?? taskSubtasksRef;
      return current.filter(s => s.id !== subtaskId);
    });
  }

  const timelineIcons: Record<string, React.ReactNode> = {
    create: <div className="h-6 w-6 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center"><Clock className="h-3 w-3 text-[var(--accent-blue)]" /></div>,
    audit: <div className="h-6 w-6 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center"><Shield className="h-3 w-3 text-[var(--accent-blue)]" /></div>,
    assign: <div className="h-6 w-6 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center"><UserPlus className="h-3 w-3 text-[var(--accent-green)]" /></div>,
    status: <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center"><Clock className="h-3 w-3 text-purple-400" /></div>,
    subtask: <div className="h-6 w-6 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center"><CheckCircle className="h-3 w-3 text-[var(--accent-green)]" /></div>,
    done: <div className="h-6 w-6 rounded-full bg-[var(--accent-green)]/20 flex items-center justify-center"><CheckCircle className="h-3 w-3 text-[var(--accent-green)]" /></div>,
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/${locale}/tasks/`} className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Tasks
        </Link>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="text-[var(--text-primary)] font-medium">{task.id.replace("task_", "TASK-").toUpperCase()}</span>
      </div>

      {/* Cross-module links */}
      <CrossModuleLinks
        linkedAuditId={task.linked_audit_id}
        linkedCapaId={task.linked_capa_id}
        linkedTicketId={task.linked_ticket_id}
        linkedSopId={task.linked_sop_id}
        source={task.source}
      />

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Title & description */}
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)]">{task.title}</h1>
            {task.description && (
              <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{task.description}</p>
            )}
          </div>

          {/* Due date bar */}
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">Due Date</span>
              <span className={`text-sm font-medium ${dueInfo.overdue ? "text-[var(--accent-red,#F85149)]" : "text-[var(--text-primary)]"}`}>
                {dueInfo.text}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
              <div
                className={`h-2 rounded-full ${dueBarColor} transition-all duration-500`}
                style={{ width: `${dueInfo.percent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Due: {formatShortDate(task.due_date)}
            </p>
          </div>

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <SubtaskTree
              subtasks={subtasks}
              onToggle={handleSubtaskToggle}
              onAdd={handleSubtaskAdd}
              onDelete={handleSubtaskDelete}
              onReorder={() => {}}
            />
          )}

          {/* Timeline */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Activity Timeline</h2>
            <div className="relative space-y-0">
              {timeline.map((event, i) => (
                <div key={i} className="relative flex gap-3 pb-4">
                  {i < timeline.length - 1 && (
                    <div className="absolute start-3 top-6 bottom-0 w-px bg-[var(--border-default)]" />
                  )}
                  <div className="shrink-0">{timelineIcons[event.icon] ?? timelineIcons.create}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">{event.text}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(event.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
                <Paperclip className="inline h-4 w-4 me-1" />
                Attachments ({task.attachments.length})
              </h2>
              <div className="space-y-2">
                {task.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3"
                  >
                    <FileText className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">{att.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{att.type} · {att.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              <MessageSquare className="inline h-4 w-4 me-1" />
              Comments
            </h2>
            <div className="space-y-3">
              {comments.map(c => {
                const author = getUser(c.author_id);
                return (
                  <div
                    key={c.id}
                    className={`rounded-md border border-[var(--border-default)] p-4 ${
                      c.is_system ? "bg-[var(--accent-blue)]/5" : "bg-[var(--bg-secondary)]"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {c.is_system ? (
                        <div className="h-6 w-6 rounded-full bg-[var(--accent-blue)]/20 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-[var(--accent-blue)]" />
                        </div>
                      ) : (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">{author ? getInitials(author.name) : "?"}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {c.is_system ? "System" : author?.name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.text}</p>
                  </div>
                );
              })}

              {/* Add comment */}
              <div className="space-y-2">
                <textarea
                  className="flex min-h-[80px] w-full rounded-sm border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)]"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={!commentText.trim()}
                  onClick={() => setCommentText("")}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Status</p>
              <TaskStatusChip status={task.status} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Priority</p>
              <TaskPriorityBadge priority={task.priority} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Assignee</p>
              {assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">{getInitials(assignee.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-[var(--text-primary)]">{assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-[var(--text-muted)]">Unassigned</span>
              )}
            </div>
            {reporter && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Reporter</p>
                <span className="text-sm text-[var(--text-primary)]">{reporter.name}</span>
              </div>
            )}
            {project && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Project</p>
                <Link
                  href={`/${locale}/tasks/projects/${project.id}/`}
                  className="flex items-center gap-2 hover:text-[var(--accent-blue)] transition-colors"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="text-sm text-[var(--text-primary)]">{project.name}</span>
                </Link>
              </div>
            )}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Location</p>
              <span className="text-sm text-[var(--text-primary)]">{locationLabels[task.location_id] ?? task.location_id}</span>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Source</p>
              <Badge variant={sourceInfo.variant}>{sourceInfo.label}</Badge>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Created</p>
              <span className="text-xs text-[var(--text-secondary)]">{formatDate(task.created_at)}</span>
            </div>
            {task.updated_at && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Updated</p>
                <span className="text-xs text-[var(--text-secondary)]">{formatDate(task.updated_at)}</span>
              </div>
            )}
            {task.estimated_hours && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Est. Hours</p>
                <span className="text-sm text-[var(--text-primary)]">{task.estimated_hours}h</span>
              </div>
            )}
            {task.tags && task.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map(tag => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {task.watchers && task.watchers.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1">Watchers</p>
                <div className="flex -space-x-1">
                  {task.watchers.map(wId => {
                    const w = getUser(wId);
                    return w ? (
                      <Avatar key={wId} className="h-6 w-6 border-2 border-[var(--bg-secondary)]">
                        <AvatarFallback className="text-[10px]">{getInitials(w.name)}</AvatarFallback>
                      </Avatar>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="secondary" className="w-full" size="sm">
              <UserPlus className="h-3.5 w-3.5" /> Assign to Me
            </Button>
            <Button variant="secondary" className="w-full" size="sm">
              <CheckCircle className="h-3.5 w-3.5" /> Mark Done
            </Button>
            <Button variant="secondary" className="w-full" size="sm">
              <Shield className="h-3.5 w-3.5" /> Create CAPA
            </Button>
            <Button variant="destructive" className="w-full" size="sm">
              <XCircle className="h-3.5 w-3.5" /> Cancel Task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
