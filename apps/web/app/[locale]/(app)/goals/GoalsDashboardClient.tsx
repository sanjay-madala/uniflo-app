"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGoalsListData } from "@/lib/data/useGoalsData";
import type { Goal, GoalTimeframe, KeyResult } from "@uniflo/mock-data";
import { PageHeader, Button, Pagination } from "@uniflo/ui";
import { Plus } from "lucide-react";
import { GoalKPIRow } from "@/components/goals/GoalKPIRow";
import { GoalFilterBar } from "@/components/goals/GoalFilterBar";
import { GoalTimeframeSelector } from "@/components/goals/GoalTimeframeSelector";
import { GoalTreeNode } from "@/components/goals/GoalTreeNode";
import { GoalEmptyState } from "@/components/goals/GoalEmptyState";
import { KeyResultProgressModal } from "@/components/goals/KeyResultProgressModal";
import { LinkedEvidencePanel } from "@/components/goals/LinkedEvidencePanel";

const PER_PAGE = 10;

export default function GoalsDashboardClient() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { goals: allGoals, kpis: goalDashboardKPIs, isLoading, error } = useGoalsListData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("Q1");
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // KR Progress Modal state
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null);

  // Evidence Panel state
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [evidenceGoal, setEvidenceGoal] = useState<Goal | null>(null);

  const goals = allGoals as Goal[];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-4 w-72 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
        <div className="space-y-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load goals: {error.message}</p>
        </div>
      </div>
    );
  }

  const filtered = useMemo(() => {
    let result = [...goals];

    // Filter by timeframe
    result = result.filter((g) => g.timeframe === timeframe || timeframe === "annual");

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.title.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      if (statusFilter === "draft") {
        result = result.filter((g) => g.status === "draft");
      } else {
        result = result.filter((g) => g.health === statusFilter);
      }
    }

    if (levelFilter !== "all") {
      result = result.filter((g) => g.level === levelFilter);
    }

    if (ownerFilter !== "all") {
      result = result.filter((g) => g.owner_id === ownerFilter);
    }

    return result;
  }, [goals, search, statusFilter, levelFilter, ownerFilter, timeframe]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageData = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleExpand(goalId: string) {
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  }

  function handleKRClick(krId: string) {
    for (const goal of goals) {
      const kr = goal.key_results.find((k) => k.id === krId);
      if (kr) {
        setSelectedKR(kr);
        setIsProgressModalOpen(true);
        return;
      }
    }
  }

  function handleKPIFilterClick(filter: string) {
    if (filter === "all") {
      setStatusFilter("all");
    } else {
      setStatusFilter(filter);
    }
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Goals & OKRs"
        subtitle="Track objectives powered by your operational data"
        actions={
          <div className="flex items-center gap-2">
            <GoalTimeframeSelector value={timeframe} onChange={setTimeframe} />
            <Link href={`/${locale}/goals/team`}>
              <Button variant="secondary" size="sm">Team View</Button>
            </Link>
            <Link href={`/${locale}/goals/create`}>
              <Button size="sm">
                <Plus className="h-4 w-4" /> New Goal
              </Button>
            </Link>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      <GoalKPIRow kpis={goalDashboardKPIs} onFilterClick={handleKPIFilterClick} />

      <GoalFilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
        levelFilter={levelFilter}
        onLevelChange={(v) => { setLevelFilter(v); setPage(1); }}
        ownerFilter={ownerFilter}
        onOwnerChange={(v) => { setOwnerFilter(v); setPage(1); }}
        resultCount={filtered.length}
      />

      {/* Goal Tree */}
      {pageData.length > 0 ? (
        <div className="flex flex-col gap-3" role="tree" aria-label="Goals tree">
          {pageData.map((goal) => (
            <GoalTreeNode
              key={goal.id}
              goal={goal}
              locale={locale}
              expanded={expandedGoalIds.has(goal.id)}
              onToggleExpand={() => toggleExpand(goal.id)}
              onKRClick={handleKRClick}
            />
          ))}
        </div>
      ) : (
        <GoalEmptyState onCreateGoal={() => router.push(`/${locale}/goals/create`)} />
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

      {/* KR Progress Modal */}
      <KeyResultProgressModal
        open={isProgressModalOpen}
        onOpenChange={setIsProgressModalOpen}
        kr={selectedKR}
        onSave={(krId, newValue, note) => {
          // Mock save: in a real app this would update state/API
          setIsProgressModalOpen(false);
        }}
      />

      {/* Evidence Panel */}
      {evidenceGoal && (
        <LinkedEvidencePanel
          open={isEvidenceOpen}
          onOpenChange={setIsEvidenceOpen}
          goal={evidenceGoal}
        />
      )}
    </div>
  );
}
