"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function MfaPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [resent, setResent] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    if (digits.every((d) => d !== "")) {
      if (typeof window !== "undefined") {
        localStorage.setItem("uniflo-auth", "true");
      }
      router.push(`/${locale}/dashboard/`);
    }
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "40px", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg, #58A6FF 0%, #388BFD 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <span style={{ color: "white", fontSize: "20px", fontWeight: 700 }}>U</span>
        </div>

        <h1 style={{ color: "var(--text-primary)", fontSize: "20px", fontWeight: 600, margin: "0 0 8px 0" }}>Enter verification code</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "0 0 32px 0" }}>We sent a 6-digit code to your email</p>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: "48px",
                height: "56px",
                textAlign: "center",
                fontSize: "20px",
                fontWeight: 600,
                borderRadius: "8px",
                border: "1px solid var(--border-default)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
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
            marginBottom: "16px",
            opacity: digits.every((d) => d !== "") ? 1 : 0.5,
          }}
        >
          Verify
        </button>

        <div>
          {resent ? (
            <span style={{ color: "var(--accent-green)", fontSize: "13px" }}>Code sent!</span>
          ) : (
            <button
              onClick={handleResend}
              style={{ background: "none", border: "none", color: "var(--accent-blue)", fontSize: "13px", cursor: "pointer" }}
            >
              Resend code
            </button>
          )}
        </div>

        <div style={{ marginTop: "24px" }}>
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
