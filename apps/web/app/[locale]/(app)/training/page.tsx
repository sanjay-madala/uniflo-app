"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useTrainingModulesData } from "@/lib/data/useTrainingData";
import type {
  TrainingModule,
  TrainingEnrollment,
} from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  KPICard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Pagination,
} from "@uniflo/ui";
import { LayoutGrid, List, Plus, BookOpen, ArrowUpDown } from "lucide-react";
import { ModuleCard } from "@/components/training/ModuleCard";
import { ModuleStatusBadge } from "@/components/training/ModuleStatusBadge";
import { DifficultyBadge } from "@/components/training/DifficultyBadge";
import { CompletionRateBar } from "@/components/training/CompletionRateBar";

const PER_PAGE = 9;
const CURRENT_USER = "user_001";

const categoryLabels: Record<string, string> = {
  safety: "Safety",
  operations: "Operations",
  compliance: "Compliance",
  customer_service: "Customer Service",
  onboarding: "Onboarding",
  leadership: "Leadership",
};

type SortKey = "title" | "category" | "duration" | "completion" | "enrolled";
type SortDir = "asc" | "desc";

export default function TrainingLibraryPage() {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { data: modules, enrollments } = useTrainingModulesData();

  // KPI calculations
  const publishedCount = modules.filter((m) => m.status === "published").length;
  const avgCompletion = modules.length > 0
    ? Math.round(modules.reduce((sum, m) => sum + m.completion_rate, 0) / modules.length)
    : 0;
  const overdueCount = enrollments.filter((e) => e.status === "overdue").length;

  // Filtering
  const filtered = useMemo(() => {
    let result = [...modules];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") result = result.filter((m) => m.category === categoryFilter);
    if (difficultyFilter !== "all") result = result.filter((m) => m.difficulty === difficultyFilter);
    if (statusFilter !== "all") result = result.filter((m) => m.status === statusFilter);

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "duration":
          cmp = a.estimated_duration_minutes - b.estimated_duration_minutes;
          break;
        case "completion":
          cmp = a.completion_rate - b.completion_rate;
          break;
        case "enrolled":
          cmp = a.total_enrolled - b.total_enrolled;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [modules, search, categoryFilter, difficultyFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function getEnrollment(moduleId: string): TrainingEnrollment | undefined {
    return enrollments.find((e) => e.module_id === moduleId && e.user_id === CURRENT_USER);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
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
        title="Training Library"
        subtitle="Browse and manage training modules"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              {viewMode === "grid" ? "List" : "Grid"}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" /> New Module
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="Total Modules" value={modules.length} />
        <KPICard title="Published" value={publishedCount} />
        <KPICard title="Avg Completion" value={`${avgCompletion}%`} />
        <KPICard title="Overdue Enrollments" value={overdueCount} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search modules..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-64"
        />
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="customer_service">Customer Service</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="leadership">Leadership</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={(v) => { setDifficultyFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-xs text-[var(--text-muted)]">
        {filtered.length} module{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* Grid View */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageData.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              enrollment={getEnrollment(mod.id)}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortButton label="Title" field="title" /></TableHead>
              <TableHead className="w-[120px]"><SortButton label="Category" field="category" /></TableHead>
              <TableHead className="w-[100px]">Difficulty</TableHead>
              <TableHead className="w-[80px]"><SortButton label="Duration" field="duration" /></TableHead>
              <TableHead className="w-[140px]"><SortButton label="Completion" field="completion" /></TableHead>
              <TableHead className="w-[80px]"><SortButton label="Enrolled" field="enrolled" /></TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((mod) => (
              <TableRow key={mod.id} className="cursor-pointer">
                <TableCell>
                  <a
                    href={`/${locale}/training/${mod.id}/`}
                    className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                  >
                    {mod.title}
                  </a>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                    {mod.description}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="text-xs">{categoryLabels[mod.category] ?? mod.category}</span>
                </TableCell>
                <TableCell>
                  <DifficultyBadge difficulty={mod.difficulty} />
                </TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">
                  {mod.estimated_duration_minutes} min
                </TableCell>
                <TableCell>
                  <CompletionRateBar rate={mod.completion_rate} />
                </TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">
                  {mod.total_completed}/{mod.total_enrolled}
                </TableCell>
                <TableCell>
                  <ModuleStatusBadge status={mod.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            No modules match your search
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Try adjusting your filters or search terms
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearch("");
              setCategoryFilter("all");
              setDifficultyFilter("all");
              setStatusFilter("all");
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Page {page} of {totalPages}
          </span>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
