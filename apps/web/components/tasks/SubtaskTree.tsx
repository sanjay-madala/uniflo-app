"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { Input } from "@uniflo/ui";
import { users } from "@uniflo/mock-data";
import type { Subtask, User } from "@uniflo/mock-data";
import { SubtaskProgressBar } from "./SubtaskProgressBar";

interface SubtaskTreeProps {
  subtasks: Subtask[];
  onToggle: (subtaskId: string) => void;
  onAdd: (title: string) => void;
  onReorder?: (subtaskIds: string[]) => void;
  onDelete: (subtaskId: string) => void;
  defaultExpanded?: boolean;
}

const NOW = new Date("2026-03-14T12:00:00Z");

function getUserName(id: string | null | undefined): string | null {
  if (!id) return null;
  const user = (users as User[]).find(u => u.id === id);
  return user?.name ?? null;
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SubtaskTree({ subtasks, onToggle, onAdd, onDelete, defaultExpanded }: SubtaskTreeProps) {
  const doneCount = subtasks.filter(s => s.status === "done").length;
  const hasIncomplete = doneCount < subtasks.length;

  const [expanded, setExpanded] = useState(defaultExpanded ?? hasIncomplete);
  const [addMode, setAddMode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleAdd() {
    if (newTitle.trim()) {
      onAdd(newTitle.trim());
    }
    setNewTitle("");
    setAddMode(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") { setNewTitle(""); setAddMode(false); }
  }

  function handleDeleteClick(subtaskId: string) {
    if (deletingId === subtaskId) {
      onDelete(subtaskId);
      setDeletingId(null);
    } else {
      setDeletingId(subtaskId);
      setTimeout(() => setDeletingId(null), 3000);
    }
  }

  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)]">
      {/* Header */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/50 transition-colors"
      >
        {expanded
          ? <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
          : <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        }
        <span>Subtasks ({doneCount}/{subtasks.length} complete)</span>
        <div className="flex-1 max-w-[200px]">
          <SubtaskProgressBar subtasks={subtasks} size="md" />
        </div>
      </button>

      {/* Content */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3 space-y-1">
            {subtasks.map(subtask => {
              const isDone = subtask.status === "done";
              const isOverdue = !isDone && subtask.due_date && new Date(subtask.due_date) < NOW;
              const assigneeName = getUserName(subtask.assignee_id);

              return (
                <div
                  key={subtask.id}
                  className="group flex items-start gap-3 rounded-md px-2 py-2 hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => onToggle(subtask.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isDone
                        ? "border-[var(--accent-green)] bg-[var(--accent-green)]"
                        : "border-[var(--border-default)] hover:border-[var(--accent-blue)]"
                    }`}
                    aria-label={isDone ? `Mark "${subtask.title}" incomplete` : `Mark "${subtask.title}" complete`}
                  >
                    {isDone && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm transition-all duration-150 ${
                      isDone
                        ? "line-through text-[var(--text-muted)]"
                        : "text-[var(--text-primary)]"
                    }`}>
                      {subtask.title}
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      isOverdue
                        ? "text-[var(--accent-red)]"
                        : "text-[var(--text-muted)]"
                    }`}>
                      {isDone && subtask.completed_at
                        ? `Completed ${formatShortDate(subtask.completed_at)}`
                        : subtask.due_date
                          ? `Due: ${formatShortDate(subtask.due_date)}`
                          : null
                      }
                    </p>
                  </div>

                  {/* Assignee */}
                  {assigneeName && (
                    <span className="hidden lg:inline text-xs text-[var(--text-secondary)] shrink-0 mt-0.5">
                      {assigneeName}
                    </span>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteClick(subtask.id)}
                    className="shrink-0 mt-0.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--accent-red)] transition-all"
                    aria-label={`Remove subtask "${subtask.title}"`}
                  >
                    {deletingId === subtask.id ? (
                      <span className="text-xs text-[var(--accent-red)]">Remove?</span>
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              );
            })}

            {/* Add subtask */}
            {addMode ? (
              <div className="px-2 py-1">
                <Input
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAdd}
                  placeholder="Enter subtask title..."
                  className="text-sm"
                />
              </div>
            ) : (
              <button
                onClick={() => setAddMode(true)}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add subtask
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
