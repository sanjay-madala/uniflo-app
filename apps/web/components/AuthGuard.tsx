"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const auth = typeof window !== "undefined" ? localStorage.getItem("uniflo-auth") : null;
    if (!auth) {
      router.replace(`/${locale}/login/`);
    } else {
      setChecked(true);
    }
  }, [locale, router]);

  if (!checked) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: "32px", height: "32px", border: "2px solid var(--border-default)",
          borderTopColor: "var(--accent-blue)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
