"use client";

import { ApiClientProvider } from "@uniflo/api-client";
import { auth } from "@/lib/firebase";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function DataProvider({ children }: { children: React.ReactNode }) {
  if (API_MODE === "mock") {
    return <>{children}</>;
  }

  return (
    <ApiClientProvider
      baseUrl={API_BASE_URL}
      getToken={async () => {
        const user = auth.currentUser;
        if (!user) return null;
        return user.getIdToken();
      }}
    >
      {children}
    </ApiClientProvider>
  );
}
