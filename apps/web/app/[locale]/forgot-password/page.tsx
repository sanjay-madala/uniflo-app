"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");
    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-blue) 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <span style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>U</span>
          </div>
          <h1 style={{ color: "var(--text-primary)", fontSize: "24px", fontWeight: 700, margin: "0 0 4px 0" }}>
            Reset Password
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: 0 }}>
            {submitted ? "We sent you a reset link" : "Enter your email to receive a reset link"}
          </p>
        </div>

        {submitted ? (
          /* Success state */
          <div
            style={{
              padding: "24px",
              borderRadius: "8px",
              border: "1px solid rgba(63,185,80,0.3)",
              backgroundColor: "rgba(63,185,80,0.05)",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>&#9993;</div>
            <p style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: 500, margin: "0 0 8px 0" }}>
              Check your email
            </p>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
              We&apos;ve sent a password reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
              Please check your inbox and follow the instructions.
            </p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="email"
                style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginBottom: "6px" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: `1px solid ${error ? "var(--accent-red)" : "var(--border-default)"}`,
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = error ? "var(--accent-red)" : "var(--accent-blue)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--accent-red)" : "var(--border-default)"; }}
              />
              {error && (
                <p style={{ color: "var(--accent-red)", fontSize: "12px", margin: "4px 0 0 0" }}>{error}</p>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                height: "40px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--accent-blue)",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              Send reset link
            </button>
          </form>
        )}

        {/* Back to login */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            href={`/${locale}/login/`}
            style={{ fontSize: "13px", color: "var(--accent-blue)", textDecoration: "none" }}
          >
            &larr; Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
