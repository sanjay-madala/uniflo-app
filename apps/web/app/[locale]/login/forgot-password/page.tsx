"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/${locale}/login/forgot-password/sent/?email=${encodeURIComponent(email)}`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "40px" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #58A6FF 0%, #388BFD 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <span style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>U</span>
        </div>

        <h1 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, textAlign: "center", margin: "0 0 8px 0" }}>Reset your password</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", textAlign: "center", margin: "0 0 32px 0" }}>Enter your email and we&apos;ll send you a reset link</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "var(--text-secondary)", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "var(--accent-blue)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "20px",
            }}
          >
            Send reset link
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <a
            href={`/${locale}/login/`}
            style={{ color: "var(--text-muted)", fontSize: "13px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <ArrowLeft size={14} /> Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
