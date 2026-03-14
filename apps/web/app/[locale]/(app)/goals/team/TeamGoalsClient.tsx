"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  goals as allGoals,
  teamGoalSummaries,
  users,
} from "@uniflo/mock-data";
import type { Goal, GoalTimeframe, TeamGoalSummary } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Input,
  Badge,
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
import { LayoutGrid, List, ChevronDown, ChevronRight } from "lucide-react";
import { GoalTimeframeSelector } from "@/components/goals/GoalTimeframeSelector";
import { GoalCard } from "@/components/goals/GoalCard";
import { GoalProgressRing } from "@/components/goals/GoalProgressRing";
import { GoalProgressBar } from "@/components/goals/GoalProgressBar";
import { GoalStatusChip } from "@/components/goals/GoalStatusChip";
import { GoalOwnerAvatar } from "@/components/goals/GoalOwnerAvatar";

export default function TeamGoalsClient() {
  const { locale } = useParams<{ locale: string }>();

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeframe, setTimeframe] = useState<GoalTimeframe>("Q1");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [collapsedTeams, setCollapsedTeams] = useState<Set<string>>(new Set());

  const goals = allGoals as Goal[];

  // Organization-level goals
  const orgGoals = useMemo(() => {
    let result = goals.filter((g) => g.level === "organization");
    if (statusFilter !== "all") result = result.filter((g) => g.health === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((g) => g.title.toLowerCase().includes(q));
    }
    return result;
  }, [goals, statusFilter, search]);

  // Team sections
  const teamSections = useMemo(() => {
    return teamGoalSummaries.map((team) => {
      let teamGoals = team.goals;
      if (statusFilter !== "all") teamGoals = teamGoals.filter((g) => g.health === statusFilter);
      if (search) {
        const q = search.toLowerCase();
        teamGoals = teamGoals.filter(
          (g) => g.title.toLowerCase().includes(q) || team.team_name.toLowerCase().includes(q)
        );
      }
      return { ...team, goals: teamGoals };
    }).filter((t) => t.goals.length > 0 || !search);
  }, [statusFilter, search]);

  // Individual goals (not assigned to a team)
  const individualGoals = useMemo(() => {
    let result = goals.filter((g) => g.level === "individual" && !g.team_id);
    if (statusFilter !== "all") result = result.filter((g) => g.health === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) => g.title.toLowerCase().includes(q) || g.owner_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [goals, statusFilter, search]);

  // All filtered goals for table view
  const allFilteredGoals = useMemo(() => {
    let result = [...goals];
    if (levelFilter !== "all") result = result.filter((g) => g.level === levelFilter);
    if (statusFilter !== "all") result = result.filter((g) => g.health === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) => g.title.toLowerCase().includes(q) || g.owner_name.toLowerCase().includes(q) || (g.team_name ?? "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [goals, levelFilter, statusFilter, search]);

  function toggleTeam(teamId: string) {
    setCollapsedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  }

  // Org summary
  const orgAvgProgress = orgGoals.length > 0
    ? Math.round(orgGoals.reduce((sum, g) => sum + g.progress_pct, 0) / orgGoals.length)
    : 0;

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Team Goals"
        subtitle="Goal progress across teams and individuals"
        actions={
          <div className="flex items-center gap-2">
            <GoalTimeframeSelector value={timeframe} onChange={setTimeframe} />
            <div className="flex items-center rounded-lg border border-[var(--border-default)] overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`p-2 ${viewMode === "cards" ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                aria-label="Card view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 ${viewMode === "table" ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                aria-label="Table view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search teams/people..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
            <SelectItem value="team">Team</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on_track">On Track</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="behind">Behind</SelectItem>
            <SelectItem value="achieved">Achieved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Org-Level Summary */}
      {(levelFilter === "all" || levelFilter === "organization") && orgGoals.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Organization Goals</h3>
              <span className="text-xs text-[var(--text-muted)]">{orgGoals.length} goals</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-[var(--text-primary)]">{orgAvgProgress}%</div>
                <div className="text-xs text-[var(--text-muted)]">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "cards" ? (
        <>
          {/* Team Sections */}
          {(levelFilter === "all" || levelFilter === "team") && teamSections.map((team) => {
            const isCollapsed = collapsedTeams.has(team.team_id);
            return (
              <div key={team.team_id} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
                {/* Team Header */}
                <button
                  type="button"
                  onClick={() => toggleTeam(team.team_id)}
                  className="w-full flex items-center justify-between mb-3"
                >
                  <div className="flex items-center gap-3">
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                    )}
                    <div className="text-start">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{team.team_name} Team</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[var(--text-muted)]">Team Lead:</span>
                        <GoalOwnerAvatar name={team.owner_name} avatar={team.owner_avatar} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <span>{team.goal_count} goals</span>
                    <span>Avg: {team.avg_progress}%</span>
                    <span className="text-[var(--accent-green)]">On Track: {team.on_track}</span>
                    {team.at_risk > 0 && <span className="text-yellow-400">At Risk: {team.at_risk}</span>}
                    {team.behind > 0 && <span className="text-[var(--accent-red)]">Behind: {team.behind}</span>}
                  </div>
                </button>

                {/* Goal Cards */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.goals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} locale={locale} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Individual Goals */}
          {(levelFilter === "all" || levelFilter === "individual") && individualGoals.length > 0 && (
            <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Individual Goals</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {individualGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Table View */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team / Owner</TableHead>
              <TableHead>Goal Title</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>KRs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allFilteredGoals.map((goal) => {
              const autoCount = goal.key_results.filter((kr) => kr.tracking_type === "auto").length;
              return (
                <TableRow key={goal.id} className="cursor-pointer">
                  <TableCell>
                    <span className="text-sm text-[var(--text-primary)]">
                      {goal.team_name ?? goal.owner_name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/${locale}/goals/${goal.id}`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                    >
                      {goal.title}
                    </Link>
                  </TableCell>
                  <TableCell className="w-40">
                    <GoalProgressBar progress={goal.progress_pct} health={goal.health} />
                  </TableCell>
                  <TableCell>
                    <GoalStatusChip health={goal.health} />
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[var(--text-muted)]">
                      {goal.key_results.length}{autoCount > 0 ? ` (${autoCount}a)` : ""}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Team Comparison Chart */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Team Comparison</h3>
        <div className="flex flex-col gap-3">
          {teamGoalSummaries.map((team) => (
            <div key={team.team_id} className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)] w-28 shrink-0">{team.team_name}</span>
              <div className="flex-1 h-6 rounded bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className="h-full rounded bg-[var(--accent-blue)] transition-all duration-500"
                  style={{ width: `${team.avg_progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)] w-12 text-end tabular-nums">
                {team.avg_progress}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
