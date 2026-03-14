"use client";

import { useState, useEffect, useCallback } from "react";
import { Drawer, Button, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Badge } from "@uniflo/ui";
import { ClipboardCheck, X, Plus, AlertTriangle } from "lucide-react";
import { users, projects } from "@uniflo/mock-data";
import type { Task, User, Project } from "@uniflo/mock-data";

interface FailedItem {
  name: string;
  section: string;
  score: number;
  maxScore: number;
}

interface AutoTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditId: string;
  auditTitle?: string;
  auditScore?: number;
  auditDate?: string;
  auditorName?: string;
  failedItems: FailedItem[];
  suggestedAssigneeId?: string;
  suggestedProjectId?: string;
  onTaskCreated?: (task: Partial<Task>) => void;
}

function mapScoreToPriority(score: number): Task["priority"] {
  if (score <= 3) return "critical";
  if (score <= 5) return "high";
  if (score <= 7) return "medium";
  return "low";
}

function getSuggestedSubtasks(item: FailedItem): string[] {
  const name = item.name.toLowerCase();
  if (name.includes("refriger") || name.includes("temperature") || name.includes("compressor")) {
    return [
      "Inspect equipment condition",
      "Order replacement parts if needed",
      "Schedule repair with certified technician",
      "Verify compliance after repair",
    ];
  }
  if (name.includes("fire") || name.includes("exit") || name.includes("safety")) {
    return [
      "Assess current condition",
      "Order replacement signage or equipment",
      "Install and verify compliance",
    ];
  }
  if (name.includes("staff") || name.includes("training") || name.includes("hygiene")) {
    return [
      "Prepare training materials",
      "Schedule training sessions for all shifts",
      "Conduct training and collect sign-off",
      "Follow-up assessment after 2 weeks",
    ];
  }
  return [
    "Investigate root cause",
    "Develop corrective action plan",
    "Implement corrective action",
    "Verify resolution",
  ];
}

export function AutoTaskModal({
  open,
  onOpenChange,
  auditId,
  auditTitle = "Equipment Safety Audit - Chicago",
  auditScore = 54,
  auditDate = "2026-03-12T07:00:00Z",
  auditorName = "Priya Sharma",
  failedItems,
  suggestedAssigneeId = "usr_005",
  suggestedProjectId = "proj_001",
  onTaskCreated,
}: AutoTaskModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<Array<Partial<Task>>>([]);
  const [showSummary, setShowSummary] = useState(false);

  const item = failedItems[currentIndex];
  const suggestedPriority = item ? mapScoreToPriority(item.score) : "high";
  const suggestedSubtasks = item ? getSuggestedSubtasks(item) : [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<string>(suggestedPriority);
  const [assigneeId, setAssigneeId] = useState(suggestedAssigneeId);
  const [projectId, setProjectId] = useState(suggestedProjectId);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");

  const allUsers = users as User[];
  const allProjects = projects as Project[];

  const populateFields = useCallback(() => {
    if (!item) return;
    const dueDate = new Date(new Date(auditDate).getTime() + 7 * 86400000).toISOString().split("T")[0];
    setTitle(`Fix: ${item.name}`);
    setDescription(
      `Auto-created from audit "${auditTitle}" (${auditId.replace("aud_", "AUD-").toUpperCase()}). ` +
      `Failed item: ${item.name}. Score: ${item.score}/${item.maxScore}.\n\n` +
      `Recommended action: Inspect and resolve the identified non-compliance to meet operational standards.`
    );
    setPriority(mapScoreToPriority(item.score));
    setAssigneeId(suggestedAssigneeId);
    setProjectId(suggestedProjectId);
    setSubtasks(getSuggestedSubtasks(item));
  }, [item, auditDate, auditTitle, auditId, suggestedAssigneeId, suggestedProjectId]);

  useEffect(() => {
    if (open && item) {
      setShowFields(false);
      setAnimating(true);
      const timer = setTimeout(() => {
        populateFields();
        setShowFields(true);
        setAnimating(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [open, currentIndex, item, populateFields]);

  useEffect(() => {
    if (!open) {
      setCurrentIndex(0);
      setCreatedTasks([]);
      setShowSummary(false);
      setShowFields(false);
    }
  }, [open]);

  function handleCreate() {
    const task: Partial<Task> = {
      title,
      description,
      priority: priority as Task["priority"],
      status: "todo",
      assignee_id: assigneeId || null,
      project_id: projectId || null,
      source: "audit",
      linked_audit_id: auditId,
      linked_audit_item: item?.name,
      created_at: new Date().toISOString(),
    };
    onTaskCreated?.(task);
    setCreatedTasks(prev => [...prev, task]);

    if (currentIndex < failedItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  }

  function handleSkip() {
    if (currentIndex < failedItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
  }

  function addSubtask() {
    if (newSubtask.trim()) {
      setSubtasks(prev => [...prev, newSubtask.trim()]);
    }
    setNewSubtask("");
    setAddingSubtask(false);
  }

  function removeSubtask(index: number) {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  }

  if (showSummary) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        title="Tasks Created"
        description={`${createdTasks.length} task${createdTasks.length !== 1 ? "s" : ""} created from audit ${auditId.replace("aud_", "AUD-").toUpperCase()}`}
        width="w-[560px]"
        footer={
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        }
      >
        <div className="space-y-3">
          {createdTasks.map((task, i) => (
            <div key={i} className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
              <p className="text-sm font-medium text-[var(--text-primary)]">{task.title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Priority: {task.priority} · Status: To Do
              </p>
            </div>
          ))}
          {createdTasks.length === 0 && (
            <p className="text-sm text-[var(--text-muted)]">No tasks were created.</p>
          )}
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create Task from Audit Failure"
      description="Auto-populated from audit findings"
      width="w-[560px]"
      footer={
        <>
          <Button variant="secondary" onClick={handleSkip}>
            {currentIndex < failedItems.length - 1 ? "Skip" : "Cancel"}
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || animating}>
            Create Task
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Step indicator */}
        {failedItems.length > 1 && (
          <div className="text-xs font-medium text-[var(--accent-blue)]">
            Task {currentIndex + 1} of {failedItems.length}
          </div>
        )}

        {/* Source audit card */}
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)]/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardCheck className="h-4 w-4 text-[var(--accent-blue)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">{auditTitle}</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Score: {auditScore}% (FAILED) · {failedItems.length} item{failedItems.length !== 1 ? "s" : ""} failed
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Conducted: {new Date(auditDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} by {auditorName}
          </p>
        </div>

        {/* Failed item card */}
        {item && (
          <div className="rounded-md border border-[var(--accent-red,#F85149)]/30 bg-[var(--accent-red,#F85149)]/5 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[var(--accent-red,#F85149)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">{item.name}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Section: {item.section} · Score: {item.score}/{item.maxScore}
            </p>
          </div>
        )}

        {/* Pre-filled fields */}
        <div className={`space-y-4 transition-opacity duration-300 ${showFields ? "opacity-100" : "opacity-0"}`}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Status</label>
              <Select value="todo" disabled>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Due Date</label>
              <Input
                type="date"
                defaultValue={item ? new Date(new Date(auditDate).getTime() + 7 * 86400000).toISOString().split("T")[0] : ""}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Assignee</label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {allUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}{u.id === suggestedAssigneeId ? " (suggested)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {assigneeId === suggestedAssigneeId && (
              <p className="mt-1 text-xs text-[var(--accent-blue)]">
                Suggested based on: location manager
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Project</label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Project</SelectItem>
                {allProjects.filter(p => p.status === "active").map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Suggested subtasks */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Suggested Subtasks</label>
            <div className="space-y-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3">
              {subtasks.map((st, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-[var(--text-primary)]"
                >
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--accent-blue)] bg-[var(--accent-blue)]/10">
                    <svg className="h-2.5 w-2.5 text-[var(--accent-blue)]" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  <span className="flex-1">{st}</span>
                  <button
                    onClick={() => removeSubtask(i)}
                    className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
                    aria-label={`Remove subtask: ${st}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {addingSubtask ? (
                <div className="mt-1">
                  <Input
                    autoFocus
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addSubtask(); if (e.key === "Escape") { setNewSubtask(""); setAddingSubtask(false); } }}
                    onBlur={addSubtask}
                    placeholder="Enter subtask title..."
                    className="text-sm"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAddingSubtask(true)}
                  className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent-blue)] transition-colors mt-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add subtask
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Subtasks pre-suggested based on failure type
            </p>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
