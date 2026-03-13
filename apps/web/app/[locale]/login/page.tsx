"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    if (typeof window !== "undefined") {
      localStorage.setItem("uniflo-auth", "true");
      localStorage.setItem("uniflo-user-email", email.trim());
      localStorage.setItem("uniflo-role", "admin");
    }
    router.push(`/${locale}/dashboard/`);
  };

  const handleSSO = (_provider: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("uniflo-auth", "true");
      localStorage.setItem("uniflo-user-email", "demo@uniflo.io");
      localStorage.setItem("uniflo-role", "admin");
    }
    router.push(`/${locale}/dashboard/`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "40px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", justifyContent: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "linear-gradient(135deg, #58A6FF 0%, #388BFD 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontSize: "18px", fontWeight: 700 }}>U</span>
          </div>
          <span style={{ color: "#E6EDF3", fontWeight: 700, fontSize: "24px" }}>Uniflo</span>
        </div>

        <h1 style={{ color: "#E6EDF3", fontSize: "20px", fontWeight: 600, textAlign: "center", margin: "0 0 8px 0" }}>Welcome back</h1>
        <p style={{ color: "#8B949E", fontSize: "13px", textAlign: "center", margin: "0 0 32px 0" }}>Sign in to your account</p>

        {error && (
          <div style={{
            padding: "10px 12px",
            borderRadius: "6px",
            border: "1px solid rgba(248,81,73,0.4)",
            backgroundColor: "rgba(248,81,73,0.1)",
            color: "#F85149",
            fontSize: "13px",
            marginBottom: "16px",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", color: "#E6EDF3", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="you@company.com"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "6px",
                border: `1px solid ${error && !email.trim() ? "#F85149" : "#30363D"}`,
                backgroundColor: "#0D1117",
                color: "#E6EDF3",
                fontSize: "13px",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#58A6FF"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = error && !email.trim() ? "#F85149" : "#30363D"; }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", color: "#E6EDF3", fontSize: "12px", fontWeight: 500, marginBottom: "6px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${error && !password.trim() ? "#F85149" : "#30363D"}`,
                  backgroundColor: "#0D1117",
                  color: "#E6EDF3",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#58A6FF"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = error && !password.trim() ? "#F85149" : "#30363D"; }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8B949E", display: "flex" }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ accentColor: "#58A6FF" }}
              />
              <span style={{ color: "#8B949E", fontSize: "12px" }}>Remember me</span>
            </label>
            <a
              href={`/${locale}/login/forgot-password/`}
              style={{ color: "#58A6FF", fontSize: "12px", textDecoration: "none" }}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#58A6FF",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Sign in
          </button>
        </form>

        {/* SSO Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#30363D" }} />
          <span style={{ color: "#484F58", fontSize: "12px" }}>or continue with</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#30363D" }} />
        </div>

        {/* SSO Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => handleSSO("google")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #30363D",
              backgroundColor: "transparent",
              color: "#E6EDF3",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#161B22"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSSO("microsoft")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #30363D",
              backgroundColor: "transparent",
              color: "#E6EDF3",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background-color 0.15s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#161B22"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <svg width="16" height="16" viewBox="0 0 23 23" fill="none">
              <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
              <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
              <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
              <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
            </svg>
            Microsoft
          </button>
        </div>
      </div>
    </div>
  );
}
