"use client";

import { sops as mockSops, users as mockUsers } from "@uniflo/mock-data";
import type { SOP, User } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface UseSOPsDataResult {
  data: SOP[];
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

export function useSOPsData(): UseSOPsDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useSops } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useSops();
    return {
      data: (result.data as SOP[]) ?? [],
      users: mockUsers as User[],
      isLoading: result.isLoading,
      error: result.error,
    };
  }

  return {
    data: mockSops as SOP[],
    users: mockUsers as User[],
    isLoading: false,
    error: null,
  };
}
