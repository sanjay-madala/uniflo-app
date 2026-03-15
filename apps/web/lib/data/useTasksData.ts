"use client";

import {
  tasks as mockTasks,
  users as mockUsers,
  projects as mockProjects,
} from "@uniflo/mock-data";
import type { Task, User, Project } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface UseTasksDataResult {
  data: Task[];
  users: User[];
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
}

export function useTasksData(): UseTasksDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTasks, useProjects } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const tasksResult = useTasks();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const projectsResult = useProjects();
    return {
      data: (tasksResult.data as Task[]) ?? [],
      users: mockUsers as User[],
      projects: (projectsResult.data as Project[]) ?? [],
      isLoading: tasksResult.isLoading || projectsResult.isLoading,
      error: tasksResult.error ?? projectsResult.error,
    };
  }

  return {
    data: mockTasks as Task[],
    users: mockUsers as User[],
    projects: mockProjects as Project[],
    isLoading: false,
    error: null,
  };
}
