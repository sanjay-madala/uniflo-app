"use client";

import { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createApiClient, type UnifloApiClient } from './client';

// ─── Context ─────────────────────────────────────────────────────────────────

const ApiClientContext = createContext<UnifloApiClient | null>(null);

export function useApiClient(): UnifloApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return client;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface ApiClientProviderProps {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  children: React.ReactNode;
}

export function ApiClientProvider({ baseUrl, getToken, children }: ApiClientProviderProps) {
  const client = useMemo(
    () => createApiClient({ baseUrl, getToken }),
    [baseUrl, getToken],
  );

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ApiClientContext.Provider value={client}>
        {children}
      </ApiClientContext.Provider>
    </QueryClientProvider>
  );
}
