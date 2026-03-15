"use client";

import {
  goals as mockGoals,
  goalDashboardKPIs as mockKPIs,
  teamGoalSummaries as mockTeamSummaries,
  users as mockUsers,
} from "@uniflo/mock-data";
import type { Goal, GoalDashboardKPIs, TeamGoalSummary } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------- Goals List ----------

interface UseGoalsListDataResult {
  goals: Goal[];
  kpis: GoalDashboardKPIs;
  users: typeof mockUsers;
  isLoading: boolean;
  error: Error | null;
}

export function useGoalsListData(_params?: Record<string, unknown>): UseGoalsListDataResult {
  if (API_MODE === "api") {
    // Future: use React Query hook from @uniflo/api-client
    return {
      goals: mockGoals as Goal[],
      kpis: mockKPIs,
      users: mockUsers,
      isLoading: false,
      error: null,
    };
  }

  return {
    goals: mockGoals as Goal[],
    kpis: mockKPIs,
    users: mockUsers,
    isLoading: false,
    error: null,
  };
}

// ---------- Single Goal ----------

interface UseGoalDataResult {
  goal: Goal | undefined;
  users: typeof mockUsers;
  isLoading: boolean;
  error: Error | null;
}

export function useGoalData(id: string): UseGoalDataResult {
  if (API_MODE === "api") {
    // Future: use React Query hook from @uniflo/api-client
    const allGoals = mockGoals as Goal[];
    return {
      goal: allGoals.find((g) => g.id === id),
      users: mockUsers,
      isLoading: false,
      error: null,
    };
  }

  const allGoals = mockGoals as Goal[];
  return {
    goal: allGoals.find((g) => g.id === id),
    users: mockUsers,
    isLoading: false,
    error: null,
  };
}

// ---------- Team Goals ----------

interface UseTeamGoalsDataResult {
  goals: Goal[];
  teamSummaries: TeamGoalSummary[];
  users: typeof mockUsers;
  isLoading: boolean;
  error: Error | null;
}

export function useTeamGoalsData(): UseTeamGoalsDataResult {
  return {
    goals: mockGoals as Goal[],
    teamSummaries: mockTeamSummaries as TeamGoalSummary[],
    users: mockUsers,
    isLoading: false,
    error: null,
  };
}
