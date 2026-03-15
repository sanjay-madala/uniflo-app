"use client";

import { capas as mockCapas, users as mockUsers, sops as mockSops } from "@uniflo/mock-data";
import type { CAPA, User, SOP } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface UseCAPAsDataResult {
  data: CAPA[];
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

export function useCAPAsData(): UseCAPAsDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCapas } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useCapas();
    return {
      data: (result.data as CAPA[]) ?? [],
      users: mockUsers as User[],
      isLoading: result.isLoading,
      error: result.error,
    };
  }

  return {
    data: mockCapas as CAPA[],
    users: mockUsers as User[],
    isLoading: false,
    error: null,
  };
}

interface UseCAPADataResult {
  data: CAPA | undefined;
  users: User[];
  sops: SOP[];
  isLoading: boolean;
  error: Error | null;
}

export function useCAPAData(id: string): UseCAPADataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useCapa } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useCapa(id);
    return {
      data: result.data as CAPA | undefined,
      users: mockUsers as User[],
      sops: mockSops as SOP[],
      isLoading: result.isLoading,
      error: result.error,
    };
  }

  return {
    data: (mockCapas as CAPA[]).find(c => c.id === id),
    users: mockUsers as User[],
    sops: mockSops as SOP[],
    isLoading: false,
    error: null,
  };
}
