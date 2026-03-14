"use client";

import { Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";
import { users, projects } from "@uniflo/mock-data";
import type { User, Project } from "@uniflo/mock-data";

interface TaskFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  priorityFilter: string;
  onPriorityChange: (value: string) => void;
  assigneeFilter: string;
  onAssigneeChange: (value: string) => void;
  projectFilter: string;
  onProjectChange: (value: string) => void;
  sourceFilter: string;
  onSourceChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
  lockedProject?: string;
}

export function TaskFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  assigneeFilter,
  onAssigneeChange,
  projectFilter,
  onProjectChange,
  sourceFilter,
  onSourceChange,
  dateFilter,
  onDateChange,
  lockedProject,
}: TaskFilterBarProps) {
  const allUsers = users as User[];
  const allProjects = projects as Project[];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Search tasks..."
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="w-64"
      />
      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="in_review">In Review</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Select value={priorityFilter} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Assignee" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {allUsers.map(u => (
            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!lockedProject && (
        <Select value={projectFilter} onValueChange={onProjectChange}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="none">No Project</SelectItem>
            {allProjects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Select value={sourceFilter} onValueChange={onSourceChange}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Source" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="audit">Audit</SelectItem>
          <SelectItem value="capa">CAPA</SelectItem>
          <SelectItem value="ticket">Ticket</SelectItem>
        </SelectContent>
      </Select>
      <Select value={dateFilter} onValueChange={onDateChange}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Due Date" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Dates</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="7">Due in 7 days</SelectItem>
          <SelectItem value="30">Due in 30 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
