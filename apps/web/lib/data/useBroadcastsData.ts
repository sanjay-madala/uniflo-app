"use client";

import {
  broadcasts as mockBroadcasts,
  broadcastTemplates as mockBroadcastTemplates,
  readReceipts as mockReadReceipts,
  locationReceiptSummaries as mockLocationReceiptSummaries,
  regions as mockRegions,
  users as mockUsers,
} from "@uniflo/mock-data";
import type {
  Broadcast,
  BroadcastTemplate,
  ReadReceipt,
  LocationReceiptSummary,
  Region,
  User,
} from "@uniflo/mock-data";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

// ---------------------------------------------------------------------------
// Broadcasts list
// ---------------------------------------------------------------------------

interface UseBroadcastsDataResult {
  data: Broadcast[];
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

export function useBroadcastsData(_params?: Record<string, unknown>): UseBroadcastsDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockBroadcasts as Broadcast[],
    users: mockUsers as User[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Single broadcast with receipts
// ---------------------------------------------------------------------------

interface UseBroadcastDataResult {
  broadcast: Broadcast | null;
  readReceipts: ReadReceipt[];
  locationSummaries: LocationReceiptSummary[];
  users: User[];
  isLoading: boolean;
  error: Error | null;
}

export function useBroadcastData(id: string): UseBroadcastDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  const broadcast =
    (mockBroadcasts as Broadcast[]).find((b) => b.id === id) ?? null;
  const receipts = (mockReadReceipts as ReadReceipt[]).filter(
    (r) => r.broadcast_id === id,
  );

  return {
    broadcast,
    readReceipts: receipts,
    locationSummaries: mockLocationReceiptSummaries as LocationReceiptSummary[],
    users: mockUsers as User[],
    isLoading: false,
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Broadcast templates
// ---------------------------------------------------------------------------

interface UseBroadcastTemplatesDataResult {
  data: BroadcastTemplate[];
  isLoading: boolean;
  error: Error | null;
}

export function useBroadcastTemplatesData(): UseBroadcastTemplatesDataResult {
  if (API_MODE === "api") {
    // Future: wire to @uniflo/api-client
  }

  return {
    data: mockBroadcastTemplates as BroadcastTemplate[],
    isLoading: false,
    error: null,
  };
}

// Re-export mock data for components that need the raw regions
export { mockRegions as regions };
