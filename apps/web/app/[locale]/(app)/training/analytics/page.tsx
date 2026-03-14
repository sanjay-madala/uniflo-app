"use client";

import { useState, useMemo } from "react";
import {
  trainingModules,
  trainingEnrollments,
  trainingCertificates,
  trainingLocationStats,
  trainingCompletionTrend,
} from "@uniflo/mock-data";
import type {
  TrainingModule,
  TrainingEnrollment,
  LocationTrainingStats,
} from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  KPICard,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@uniflo/ui";
import { Download, ArrowUpDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { LocationHeatmapGrid } from "@/components/training/LocationHeatmapGrid";
import { CompletionRateBar } from "@/components/training/CompletionRateBar";

const categoryLabels: Record<string, string> = {
  safety: "Safety",
  operations: "Operations",
  compliance: "Compliance",
  customer_service: "Customer Service",
  onboarding: "Onboarding",
  leadership: "Leadership",
};

type SortKey = "title" | "category" | "enrolled" | "completed" | "completionRate" | "avgScore" | "overdue";
type SortDir = "asc" | "desc";

export default function TrainingAnalyticsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("completionRate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const modules = trainingModules as TrainingModule[];
  const enrollments = trainingEnrollments as TrainingEnrollment[];
  const locationStats = trainingLocationStats as LocationTrainingStats[];
  const certificates = trainingCertificates;
  const trendData = trainingCompletionTrend;

  // KPI calculations
  const totalEnrolled = enrollments.length;
  const totalCompleted = enrollments.filter((e) => e.status === "completed").length;
  const orgCompletionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;
  const quizScores = enrollments
    .filter((e) => e.best_score !== null)
    .map((e) => e.best_score as number);
  const avgQuizScore = quizScores.length > 0
    ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
    : 0;
  const overdueCount = enrollments.filter((e) => e.status === "overdue").length;
  const certCount = certificates.length;

  // Filter stats
  const filteredStats = useMemo(() => {
    if (categoryFilter === "all") return locationStats;
    const filteredModuleIds = new Set(
      modules.filter((m) => m.category === categoryFilter).map((m) => m.id)
    );
    return locationStats.map((loc) => ({
      ...loc,
      modules: loc.modules.filter((m) => filteredModuleIds.has(m.module_id)),
    }));
  }, [locationStats, categoryFilter, modules]);

  // Module breakdown table data
  const tableData = useMemo(() => {
    let data = modules
      .filter((m) => m.status === "published")
      .filter((m) => categoryFilter === "all" || m.category === categoryFilter)
      .map((m) => {
        const modEnrollments = enrollments.filter((e) => e.module_id === m.id);
        const modOverdue = modEnrollments.filter((e) => e.status === "overdue").length;
        return {
          id: m.id,
          title: m.title,
          category: m.category,
          enrolled: m.total_enrolled,
          completed: m.total_completed,
          completionRate: m.completion_rate,
          avgScore: m.avg_score ?? 0,
          overdue: modOverdue,
        };
      });

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "category": cmp = a.category.localeCompare(b.category); break;
        case "enrolled": cmp = a.enrolled - b.enrolled; break;
        case "completed": cmp = a.completed - b.completed; break;
        case "completionRate": cmp = a.completionRate - b.completionRate; break;
        case "avgScore": cmp = a.avgScore - b.avgScore; break;
        case "overdue": cmp = a.overdue - b.overdue; break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [modules, enrollments, categoryFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
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

  function getCompletionColor(rate: number): string {
    if (rate >= 80) return "var(--accent-green)";
    if (rate >= 60) return "var(--accent-yellow, #EAB308)";
    return "var(--accent-red)";
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Training Analytics"
        subtitle="Monitor completion rates across your organization"
        actions={
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
        className="px-0 py-0 border-0"
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Org Completion Rate"
          value={`${orgCompletionRate}%`}
          trend={5}
          trendLabel="vs last month"
        />
        <KPICard
          title="Avg Quiz Score"
          value={`${avgQuizScore}%`}
          trend={3}
          trendLabel="vs last month"
        />
        <KPICard
          title="Overdue Enrollments"
          value={overdueCount}
          trend={overdueCount > 0 ? -2 : 0}
          trendLabel="vs last month"
          isPositive={false}
        />
        <KPICard
          title="Certificates Issued"
          value={certCount}
          trend={8}
          trendLabel="vs last month"
        />
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
      </div>

      {/* Location Heatmap */}
      <div
        className="rounded-sm border p-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Completion by Location
        </h2>
        <LocationHeatmapGrid stats={filteredStats} />
      </div>

      {/* Completion Trend Chart */}
      <div
        className="rounded-sm border p-4"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Completion Trend
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Downtown" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Airport" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Resort" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module Breakdown Table */}
      <div
        className="rounded-sm border"
        style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}
      >
        <div className="p-4 border-b border-[var(--border-default)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Module Breakdown</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><SortButton label="Module" field="title" /></TableHead>
              <TableHead className="w-[120px]"><SortButton label="Category" field="category" /></TableHead>
              <TableHead className="w-[100px]"><SortButton label="Enrolled" field="enrolled" /></TableHead>
              <TableHead className="w-[100px]"><SortButton label="Completed" field="completed" /></TableHead>
              <TableHead className="w-[140px]"><SortButton label="Completion Rate" field="completionRate" /></TableHead>
              <TableHead className="w-[100px]"><SortButton label="Avg Score" field="avgScore" /></TableHead>
              <TableHead className="w-[80px]"><SortButton label="Overdue" field="overdue" /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="text-sm font-medium text-[var(--text-primary)]">
                  {row.title}
                </TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">
                  {categoryLabels[row.category] ?? row.category}
                </TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">{row.enrolled}</TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">{row.completed}</TableCell>
                <TableCell>
                  <CompletionRateBar rate={row.completionRate} />
                </TableCell>
                <TableCell className="text-xs text-[var(--text-secondary)]">
                  {row.avgScore > 0 ? `${row.avgScore}%` : "--"}
                </TableCell>
                <TableCell>
                  <span
                    className="text-xs font-medium"
                    style={{ color: row.overdue > 0 ? "var(--accent-red)" : "var(--text-secondary)" }}
                  >
                    {row.overdue}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
