"use client";

import { ApiClientProvider } from "@uniflo/api-client";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function DataProvider({ children }: { children: React.ReactNode }) {
  if (API_MODE === "mock") {
    // No provider needed -- components import directly from @uniflo/mock-data
    return <>{children}</>;
  }

  return (
    <ApiClientProvider
      baseUrl={API_BASE_URL}
      getToken={async () => {
        // In API mode, read the stored auth token.
        // When Firebase Auth is wired in, this would be:
        //   const { getAuth } = await import("firebase/auth");
        //   const user = getAuth().currentUser;
        //   return user ? user.getIdToken() : null;
        if (typeof window === "undefined") return null;
        return localStorage.getItem("uniflo-api-token");
      }}
    >
      {children}
    </ApiClientProvider>
  );
}
