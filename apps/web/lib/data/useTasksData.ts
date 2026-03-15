"use client";

import {
  tasks as mockTasks,
  users as mockUsers,
  projects as mockProjects,
  taskComments as mockComments,
} from "@uniflo/mock-data";
import type { Task, User, Project, TaskComment } from "@uniflo/mock-data";

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
      data: ((tasksResult.data as any)?.data ?? []) as Task[],
      users: mockUsers as User[],
      projects: ((projectsResult.data as any)?.data ?? []) as Project[],
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

interface UseTaskDataResult {
  data: Task | undefined;
  users: User[];
  projects: Project[];
  comments: TaskComment[];
  isLoading: boolean;
  error: Error | null;
}

export function useTaskData(id: string): UseTaskDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTask, useProjects } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const taskResult = useTask(id);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const projectsResult = useProjects();
    return {
      data: ((taskResult.data as any)?.data ?? undefined) as Task | undefined,
      users: mockUsers as User[],
      projects: ((projectsResult.data as any)?.data ?? []) as Project[],
      comments: (mockComments as TaskComment[]).filter(c => c.task_id === id),
      isLoading: taskResult.isLoading || projectsResult.isLoading,
      error: taskResult.error ?? projectsResult.error,
    };
  }

  return {
    data: (mockTasks as Task[]).find(t => t.id === id),
    users: mockUsers as User[],
    projects: mockProjects as Project[],
    comments: (mockComments as TaskComment[]).filter(c => c.task_id === id),
    isLoading: false,
    error: null,
  };
}
