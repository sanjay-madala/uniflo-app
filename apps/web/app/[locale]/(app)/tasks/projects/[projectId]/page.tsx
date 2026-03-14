"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { tasks as allTasks, users, projects } from "@uniflo/mock-data";
import type { Task, TaskStatus, User, Project } from "@uniflo/mock-data";
import {
  PageHeader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Badge,
  Checkbox,
  Pagination,
  EmptyState,
} from "@uniflo/ui";
import { Plus, ArrowUpDown, ArrowLeft, ClipboardCheck, Shield, Ticket } from "lucide-react";
import { TaskStatusChip } from "@/components/tasks/TaskStatusChip";
import { TaskPriorityBadge } from "@/components/tasks/TaskPriorityBadge";
import { SubtaskProgressBar } from "@/components/tasks/SubtaskProgressBar";
import { TaskProgressSummary } from "@/components/tasks/TaskProgressSummary";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import { TaskBulkActionsBar } from "@/components/tasks/TaskBulkActionsBar";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

const NOW = new Date("2026-03-14T12:00:00Z");
const PER_PAGE = 10;

const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

type SortKey = "title" | "priority" | "status" | "assignee" | "due_date";
type SortDir = "asc" | "desc";

function getUserName(id: string | null): string {
  if (!id) return "";
  return (users as User[]).find(u => u.id === id)?.name ?? "";
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(task: Task): boolean {
  return task.status !== "done" && task.status !== "cancelled" && new Date(task.due_date) < NOW;
}

const sourceIcons: Record<string, React.ReactNode> = {
  audit: <ClipboardCheck className="h-3.5 w-3.5 text-[var(--accent-blue)]" />,
  capa: <Shield className="h-3.5 w-3.5 text-[var(--accent-yellow,#EAB308)]" />,
  ticket: <Ticket className="h-3.5 w-3.5 text-[var(--accent-purple)]" />,
};

const statusConfig: Record<Project["status"], { label: string; variant: "blue" | "success" | "warning" | "default" }> = {
  active: { label: "Active", variant: "blue" },
  completed: { label: "Completed", variant: "success" },
  on_hold: { label: "On Hold", variant: "warning" },
  archived: { label: "Archived", variant: "default" },
};

export default function ProjectScopedTasksPage() {
  const { locale, projectId } = useParams<{ locale: string; projectId: string }>();

  const project = (projects as Project[]).find(p => p.id === projectId);
  const tasks = (allTasks as Task[]).filter(t => t.project_id === projectId);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("due_date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  if (!project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<ArrowLeft className="h-6 w-6" />}
          title="Project not found"
          description={`No project with ID "${projectId}" exists.`}
          action={{ label: "Back to Projects", onClick: () => window.history.back() }}
        />
      </div>
    );
  }

  const filtered = useMemo(() => {
    let result = [...tasks];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(t => t.status === statusFilter);
    if (priorityFilter !== "all") result = result.filter(t => t.priority === priorityFilter);
    if (assigneeFilter !== "all") {
      result = assigneeFilter === "unassigned"
        ? result.filter(t => !t.assignee_id)
        : result.filter(t => t.assignee_id === assigneeFilter);
    }
    if (sourceFilter !== "all") result = result.filter(t => t.source === sourceFilter);
    if (dateFilter !== "all") {
      if (dateFilter === "overdue") {
        result = result.filter(t => isOverdue(t));
      } else {
        const days = parseInt(dateFilter, 10);
        const cutoff = new Date(NOW.getTime() + days * 86400000);
        result = result.filter(t => new Date(t.due_date) <= cutoff && new Date(t.due_date) >= NOW);
      }
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "priority": cmp = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "assignee": cmp = getUserName(a.assignee_id).localeCompare(getUserName(b.assignee_id)); break;
        case "due_date": cmp = new Date(a.due_date).getTime() - new Date(b.due_date).getTime(); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, sourceFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  function toggleAll() {
    if (selected.size === pageData.length) setSelected(new Set());
    else setSelected(new Set(pageData.map(t => t.id)));
  }

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors" onClick={() => toggleSort(field)}>
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  const percent = project.task_count > 0 ? Math.round((project.completed_task_count / project.task_count) * 100) : 0;
  const barColor = percent === 100 ? "bg-[var(--accent-green,#3FB950)]" : percent > 0 ? "bg-[var(--accent-blue,#58A6FF)]" : "bg-[var(--text-muted)]";
  const projectStatus = statusConfig[project.status];
  const ownerName = getUserName(project.owner_id);

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href={`/${locale}/tasks/`} className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
          Tasks
        </Link>
        <span className="text-[var(--text-muted)]">/</span>
        <Link href={`/${locale}/tasks/projects/`} className="text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors">
          Projects
        </Link>
        <span className="text-[var(--text-muted)]">/</span>
        <span className="text-[var(--text-primary)] font-medium">{project.name}</span>
      </div>

      {/* Project header */}
      <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{project.name}</h2>
          <Badge variant={projectStatus.variant}>{projectStatus.label}</Badge>
        </div>
        {project.description && (
          <p className="text-sm text-[var(--text-secondary)] mb-3">{project.description}</p>
        )}
        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)] mb-2">
          <span>Owner: {ownerName}</span>
          {project.due_date && <span>Due: {formatShortDate(project.due_date)}</span>}
          <span>{project.completed_task_count}/{project.task_count} tasks done</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
          <div className={`h-2 rounded-full ${barColor} transition-all duration-300`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <TaskProgressSummary tasks={tasks} />

      {/* Filters */}
      <TaskFilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={v => { setStatusFilter(v); setPage(1); }}
        priorityFilter={priorityFilter}
        onPriorityChange={v => { setPriorityFilter(v); setPage(1); }}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={v => { setAssigneeFilter(v); setPage(1); }}
        projectFilter={projectId}
        onProjectChange={() => {}}
        sourceFilter={sourceFilter}
        onSourceChange={v => { setSourceFilter(v); setPage(1); }}
        dateFilter={dateFilter}
        onDateChange={v => { setDateFilter(v); setPage(1); }}
        lockedProject={projectId}
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{filtered.length} task{filtered.length !== 1 ? "s" : ""} found</span>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={pageData.length > 0 && selected.size === pageData.length} onCheckedChange={toggleAll} />
            </TableHead>
            <TableHead className="w-16">#</TableHead>
            <TableHead><SortButton label="Title" field="title" /></TableHead>
            <TableHead className="w-[100px]"><SortButton label="Priority" field="priority" /></TableHead>
            <TableHead className="w-[100px]"><SortButton label="Status" field="status" /></TableHead>
            <TableHead className="w-[120px]"><SortButton label="Assignee" field="assignee" /></TableHead>
            <TableHead className="w-[90px]"><SortButton label="Due" field="due_date" /></TableHead>
            <TableHead className="w-12">Src</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map(task => {
            const overdue = isOverdue(task);
            return (
              <TableRow key={task.id} className="cursor-pointer">
                <TableCell onClick={e => e.stopPropagation()}>
                  <Checkbox checked={selected.has(task.id)} onCheckedChange={() => toggleSelect(task.id)} />
                </TableCell>
                <TableCell className="text-xs text-[var(--text-muted)] font-mono">
                  {task.id.replace("task_", "")}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/${locale}/tasks/${task.id}/`}
                    className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                  >
                    {task.title}
                  </Link>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-1 max-w-[200px]">
                      <SubtaskProgressBar subtasks={task.subtasks} />
                    </div>
                  )}
                </TableCell>
                <TableCell><TaskPriorityBadge priority={task.priority} /></TableCell>
                <TableCell><TaskStatusChip status={task.status} /></TableCell>
                <TableCell>
                  <span className={task.assignee_id ? "text-sm" : "text-sm text-[var(--text-muted)]"}>
                    {getUserName(task.assignee_id) || "Unassigned"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={overdue ? "text-xs font-medium text-[var(--accent-red,#F85149)]" : "text-xs text-[var(--text-secondary)]"}>
                    {overdue && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-red,#F85149)] me-1 animate-pulse" />}
                    {formatShortDate(task.due_date)}
                  </span>
                </TableCell>
                <TableCell>
                  {task.source !== "manual" && sourceIcons[task.source]}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Page {page} of {totalPages}</span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <TaskBulkActionsBar
        selectedCount={selected.size}
        onAssign={() => {}}
        onMarkDone={() => {}}
        onChangeProject={() => {}}
        onExport={() => {}}
        onClear={() => setSelected(new Set())}
      />

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} defaultProjectId={projectId} />
    </div>
  );
}
