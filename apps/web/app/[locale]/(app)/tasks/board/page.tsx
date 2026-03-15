"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTasksData } from "@/lib/data/useTasksData";
import type { Task, TaskStatus, User, Project, Subtask } from "@uniflo/mock-data";
import { KanbanBoard, type KanbanColumn, Button, PageHeader, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";
import { Plus } from "lucide-react";
import { TaskViewSwitcher } from "@/components/tasks/TaskViewSwitcher";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

const NOW = new Date("2026-03-14T12:00:00Z");

const statusColumns: Array<{ id: TaskStatus; title: string; color: string }> = [
  { id: "todo", title: "To Do", color: "var(--text-muted)" },
  { id: "in_progress", title: "In Progress", color: "var(--accent-blue)" },
  { id: "in_review", title: "In Review", color: "var(--accent-purple)" },
  { id: "done", title: "Done", color: "var(--accent-green)" },
];

const priorityLabels: Record<string, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function getUserName(id: string | null, usersList: User[]): string {
  if (!id) return "Unassigned";
  return usersList.find(u => u.id === id)?.name ?? "Unknown";
}

function getProjectInfo(projectId: string | null | undefined, projectsList: Project[]): { name: string; color: string } | null {
  if (!projectId) return null;
  const p = projectsList.find(pr => pr.id === projectId);
  return p ? { name: p.name, color: p.color } : null;
}

function formatSubtaskProgress(subtasks?: Subtask[]): string {
  if (!subtasks || subtasks.length === 0) return "";
  const done = subtasks.filter(s => s.status === "done").length;
  return `${done}/${subtasks.length} subtasks`;
}

function formatDueDate(dateStr: string, status: TaskStatus): string {
  const due = new Date(dateStr);
  const short = due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (status !== "done" && status !== "cancelled" && due < NOW) {
    return `${short} (overdue)`;
  }
  return short;
}

export default function TaskBoardPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data: tasksData, users, projects, isLoading, error } = useTasksData();
  const tasks = tasksData as Task[];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load tasks: {error.message}</p>
        </div>
      </div>
    );
  }

  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>(() => {
    const map: Record<string, TaskStatus> = {};
    tasks.forEach(t => { map[t.id] = t.status; });
    return map;
  });

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<string>("todo");

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => taskStatuses[t.id] !== "cancelled");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    if (priorityFilter !== "all") result = result.filter(t => t.priority === priorityFilter);
    if (projectFilter !== "all") {
      result = projectFilter === "none"
        ? result.filter(t => !t.project_id)
        : result.filter(t => t.project_id === projectFilter);
    }
    if (assigneeFilter !== "all") {
      result = assigneeFilter === "unassigned"
        ? result.filter(t => !t.assignee_id)
        : result.filter(t => t.assignee_id === assigneeFilter);
    }

    return result;
  }, [tasks, taskStatuses, search, priorityFilter, projectFilter, assigneeFilter]);

  const columns: KanbanColumn[] = useMemo(() => {
    return statusColumns.map(col => ({
      id: col.id,
      title: col.title,
      color: col.color,
      cards: filteredTasks
        .filter(t => taskStatuses[t.id] === col.id)
        .map(t => {
          const proj = getProjectInfo(t.project_id, projects);
          const subtaskInfo = formatSubtaskProgress(t.subtasks);
          const dueInfo = formatDueDate(t.due_date, taskStatuses[t.id] as TaskStatus);
          const descParts = [
            `${priorityLabels[t.priority] ?? t.priority} · ${getUserName(t.assignee_id, users)}`,
            dueInfo ? `Due: ${dueInfo}` : "",
            subtaskInfo,
          ].filter(Boolean);

          return {
            id: t.id,
            title: t.title,
            description: descParts.join("\n"),
            labels: [
              priorityLabels[t.priority] ?? t.priority,
              proj ? proj.name : undefined,
            ].filter((l): l is string => Boolean(l)),
            assignee: getUserName(t.assignee_id, users),
          };
        }),
    }));
  }, [filteredTasks, taskStatuses]);

  function handleCardMove(cardId: string, _fromColumnId: string, toColumnId: string) {
    setTaskStatuses(prev => ({ ...prev, [cardId]: toColumnId as TaskStatus }));
  }

  function handleAddCard(columnId: string) {
    setDefaultStatus(columnId);
    setCreateOpen(true);
  }

  const allProjects = projects;
  const allUsers = users;

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Tasks — Board View"
        subtitle="Drag and drop tasks between columns to update status"
        actions={
          <div className="flex items-center gap-2">
            <TaskViewSwitcher />
            <Button size="sm" onClick={() => { setDefaultStatus("todo"); setCreateOpen(true); }}>
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
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
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="none">No Project</SelectItem>
            {allProjects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {allUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <KanbanBoard columns={columns} onCardMove={handleCardMove} onAddCard={handleAddCard} />

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} defaultStatus={defaultStatus} />
    </div>
  );
}
