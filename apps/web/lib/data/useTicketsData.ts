"use client";

import { tickets as mockTickets, users as mockUsers } from "@uniflo/mock-data";
import type { Ticket, User } from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface UseTicketsDataResult {
  data: Ticket[];
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

export function useTicketsData(): UseTicketsDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTickets } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useTickets();
    return {
      data: ((result.data as any)?.data ?? []) as Ticket[],
      users: mockUsers as User[], // users come from org context in API mode; fallback to mock for now
      isLoading: result.isLoading,
      error: result.error,
    };
  }

  return {
    data: mockTickets as Ticket[],
    users: mockUsers as User[],
    isLoading: false,
    error: null,
  };
}

interface UseTicketDataResult {
  data: Ticket | undefined;
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

export function useTicketData(id: string): UseTicketDataResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useTicket } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useTicket(id);
    return {
      data: ((result.data as any)?.data ?? undefined) as Ticket | undefined,
      users: mockUsers as User[],
      isLoading: result.isLoading,
      error: result.error,
    };
  }

  return {
    data: (mockTickets as Ticket[]).find(t => t.id === id),
    users: mockUsers as User[],
    isLoading: false,
    error: null,
  };
}
