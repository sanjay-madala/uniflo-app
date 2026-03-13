"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Suspense } from "react";

function SentContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const email = searchParams.get("email") || "your email";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "40px", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "rgba(63,185,80,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <Mail size={28} style={{ color: "var(--accent-green)" }} />
        </div>

        <h1 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, margin: "0 0 8px 0" }}>Check your email</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 32px 0" }}>
          We&apos;ve sent a password reset link to <span style={{ color: "var(--text-secondary)" }}>{email}</span>
        </p>

        <a
          href={`/${locale}/login/`}
          style={{
            display: "inline-block",
            padding: "10px 24px",
            borderRadius: "6px",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Back to login
        </a>
      </div>
    </div>
  );
}

export default function ForgotPasswordSentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }} />}>
      <SentContent />
    </Suspense>
  );
}
