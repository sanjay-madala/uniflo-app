"use client";

import { useState } from "react";
import { Drawer, Button, Input, Textarea, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";
import { users, projects } from "@uniflo/mock-data";
import type { Task, User, Project } from "@uniflo/mock-data";

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStatus?: string;
  defaultProjectId?: string;
  onSubmit?: (data: Partial<Task>) => void;
}

const locationLabels: Record<string, string> = {
  loc_001: "Downtown Hotel",
  loc_002: "Airport Hotel",
  loc_003: "Resort",
};

export function CreateTaskModal({ open, onOpenChange, defaultStatus, defaultProjectId, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState(defaultStatus ?? "todo");
  const [assigneeId, setAssigneeId] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [locationId, setLocationId] = useState("loc_001");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");

  const allUsers = users as User[];
  const allProjects = projects as Project[];

  function handleSubmit() {
    if (!title.trim()) return;
    const data: Partial<Task> = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority as Task["priority"],
      status: status as Task["status"],
      assignee_id: assigneeId || null,
      project_id: projectId || null,
      location_id: locationId,
      due_date: dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      source: "manual",
      created_at: new Date().toISOString(),
    };
    onSubmit?.(data);
    resetForm();
    onOpenChange(false);
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus(defaultStatus ?? "todo");
    setAssigneeId("");
    setProjectId(defaultProjectId ?? "");
    setLocationId("loc_001");
    setDueDate("");
    setTags("");
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Create Task"
      description="Fill in the details to create a new task"
      width="w-[480px]"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>Create Task</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Title *</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the task" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details about the task..." rows={3} />
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
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Due Date</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Assignee</label>
          <Select value={assigneeId} onValueChange={setAssigneeId}>
            <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {allUsers.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Project</label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger><SelectValue placeholder="Select project (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Project</SelectItem>
              {allProjects.filter(p => p.status === "active").map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Location</label>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(locationLabels).map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Tags</label>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="Comma-separated tags (e.g. food-safety, training)" />
        </div>
      </div>
    </Drawer>
  );
}
