"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTasksData } from "@/lib/data/useTasksData";
import type { Task, User } from "@uniflo/mock-data";
import {
  PageHeader,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Checkbox,
  Pagination,
} from "@uniflo/ui";
import { Plus, ArrowUpDown, ClipboardCheck, Shield, Ticket } from "lucide-react";
import { TaskStatusChip } from "@/components/tasks/TaskStatusChip";
import { TaskPriorityBadge } from "@/components/tasks/TaskPriorityBadge";
import { SubtaskProgressBar } from "@/components/tasks/SubtaskProgressBar";
import { TaskProgressSummary } from "@/components/tasks/TaskProgressSummary";
import { TaskViewSwitcher } from "@/components/tasks/TaskViewSwitcher";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import { TaskBulkActionsBar } from "@/components/tasks/TaskBulkActionsBar";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";

const NOW = new Date("2026-03-14T12:00:00Z");
const PER_PAGE = 10;

const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

type SortKey = "title" | "priority" | "status" | "assignee" | "due_date";
type SortDir = "asc" | "desc";

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(task: Task): boolean {
  return task.status !== "done" && task.status !== "cancelled" && new Date(task.due_date) < NOW;
}

const sourceIcons: Record<string, React.ReactNode> = {
  audit: <ClipboardCheck className="h-3.5 w-3.5 text-[var(--accent-blue)]" />,
  capa: <Shield className="h-3.5 w-3.5 text-[var(--accent-yellow)]" />,
  ticket: <Ticket className="h-3.5 w-3.5 text-[var(--accent-purple)]" />,
};

const sourceLabels: Record<string, string> = {
  audit: "Created from Audit",
  capa: "Created from CAPA",
  ticket: "Created from Ticket",
  manual: "Manually created",
  automation: "Created by automation",
};

export default function TasksPage() {
  const { locale } = useParams<{ locale: string }>();
  const { data: allTasks, users, isLoading, error } = useTasksData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("due_date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);

  const tasks = allTasks as Task[];

  const getUserName = useCallback((id: string | null): string => {
    if (!id) return "";
    const u = (users as User[]).find(u => u.id === id);
    return u?.name ?? "";
  }, [users]);

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
    if (projectFilter !== "all") {
      result = projectFilter === "none"
        ? result.filter(t => !t.project_id)
        : result.filter(t => t.project_id === projectFilter);
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
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "priority":
          cmp = (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
        case "assignee":
          cmp = getUserName(a.assignee_id).localeCompare(getUserName(b.assignee_id));
          break;
        case "due_date":
          cmp = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, assigneeFilter, projectFilter, sourceFilter, dateFilter, sortKey, sortDir, getUserName]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-4 w-72 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="space-y-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load tasks: {error.message}</p>
        </div>
      </div>
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === pageData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageData.map(t => t.id)));
    }
  }

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
      onClick={() => toggleSort(field)}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Tasks"
        subtitle="Assign and track tasks across your team"
        actions={
          <div className="flex items-center gap-2">
            <TaskViewSwitcher />
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      <TaskProgressSummary tasks={tasks} />

      <TaskFilterBar
        search={search}
        onSearchChange={v => { setSearch(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={v => { setStatusFilter(v); setPage(1); }}
        priorityFilter={priorityFilter}
        onPriorityChange={v => { setPriorityFilter(v); setPage(1); }}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={v => { setAssigneeFilter(v); setPage(1); }}
        projectFilter={projectFilter}
        onProjectChange={v => { setProjectFilter(v); setPage(1); }}
        sourceFilter={sourceFilter}
        onSourceChange={v => { setSourceFilter(v); setPage(1); }}
        dateFilter={dateFilter}
        onDateChange={v => { setDateFilter(v); setPage(1); }}
      />

      <div className="text-xs text-[var(--text-muted)]">{filtered.length} task{filtered.length !== 1 ? "s" : ""} found</div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={pageData.length > 0 && selected.size === pageData.length}
                onCheckedChange={toggleAll}
              />
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
                  <Checkbox
                    checked={selected.has(task.id)}
                    onCheckedChange={() => toggleSelect(task.id)}
                  />
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
                  <span className={overdue ? "text-xs font-medium text-[var(--accent-red)]" : "text-xs text-[var(--text-secondary)]"}>
                    {overdue && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-red)] me-1 animate-pulse" />}
                    {formatShortDate(task.due_date)}
                  </span>
                </TableCell>
                <TableCell>
                  {task.source !== "manual" && (
                    <div className="relative group">
                      {sourceIcons[task.source] ?? null}
                      <div className="pointer-events-none absolute bottom-full start-1/2 -translate-x-1/2 mb-1.5 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <div className="rounded-md bg-[var(--bg-elevated)] px-2 py-1 text-xs text-[var(--text-primary)] shadow-lg whitespace-nowrap">
                          {sourceLabels[task.source]}
                        </div>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          Page {page} of {totalPages}
        </span>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <TaskBulkActionsBar
        selectedCount={selected.size}
        onAssign={() => {}}
        onMarkDone={() => {}}
        onChangeProject={() => {}}
        onExport={() => {}}
        onClear={() => setSelected(new Set())}
      />

      <CreateTaskModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
