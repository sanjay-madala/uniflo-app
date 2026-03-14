"use client";

import { useState, useMemo } from "react";
import { projects as allProjects, users } from "@uniflo/mock-data";
import type { Project, User } from "@uniflo/mock-data";
import { PageHeader, Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@uniflo/ui";
import { Plus } from "lucide-react";
import { ProjectCard } from "@/components/tasks/ProjectCard";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");

  const projectsList = allProjects as Project[];
  const allUsers = users as User[];

  const filtered = useMemo(() => {
    let result = [...projectsList];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    if (ownerFilter !== "all") result = result.filter(p => p.owner_id === ownerFilter);

    // Sort: active first, then completed, then on_hold, then archived
    const statusOrder: Record<string, number> = { active: 0, on_hold: 1, completed: 2, archived: 3 };
    result.sort((a, b) => (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));

    return result;
  }, [projectsList, search, statusFilter, ownerFilter]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Projects"
        subtitle="Organize tasks into projects"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        }
        className="px-0 py-0 border-0"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Owner" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Owners</SelectItem>
            {allUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No projects match your filters.</p>
        </div>
      )}
    </div>
  );
}
