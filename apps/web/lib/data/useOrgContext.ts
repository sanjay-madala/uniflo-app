"use client";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

interface OrgInfo {
  name: string;
  slug: string;
  plan: string;
}

interface OrgUser {
  name: string;
  role: string;
  email: string;
}

interface UseOrgContextResult {
  org: OrgInfo;
  user: OrgUser;
  isLoading: boolean;
}

export function useOrgContext(): UseOrgContextResult {
  if (API_MODE === "api") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useOrganization } = require("@uniflo/api-client") as typeof import("@uniflo/api-client");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const result = useOrganization();
    const orgData = result.data as Record<string, string> | undefined;
    return {
      org: {
        name: orgData?.name ?? "Loading...",
        slug: orgData?.slug ?? "",
        plan: orgData?.plan ?? "",
      },
      user: {
        name: "API User",
        role: "admin",
        email: "",
      },
      isLoading: result.isLoading,
    };
  }

  return {
    org: { name: "Uniflo Demo Co", slug: "demo-corp", plan: "enterprise" },
    user: { name: "Alex Morgan", role: "admin", email: "alex.morgan@uniflo.io" },
    isLoading: false,
  };
}
