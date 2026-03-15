"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth, onAuthStateChanged } from "@/lib/firebase";

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || "mock";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (API_MODE === "mock") {
      // Mock mode: check localStorage flag
      const mockAuth = typeof window !== "undefined" ? localStorage.getItem("uniflo-auth") : null;
      if (!mockAuth) {
        router.replace(`/${locale}/login/`);
      } else {
        setChecked(true);
      }
      return;
    }

    // API mode: listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace(`/${locale}/login/`);
      } else {
        setChecked(true);
      }
    });

    return () => unsubscribe();
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
