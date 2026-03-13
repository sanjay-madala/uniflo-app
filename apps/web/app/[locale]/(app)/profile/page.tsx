"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth, type Role } from "@/lib/auth";
import { useToast, ToastProvider, Toaster } from "@uniflo/ui";

const timezones = [
  "UTC", "US/Eastern", "US/Central", "US/Mountain", "US/Pacific",
  "Europe/London", "Europe/Berlin", "Europe/Paris", "Asia/Tokyo",
  "Asia/Kolkata", "Asia/Dubai", "Australia/Sydney",
];

export default function ProfilePage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const { user, updateUser } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user.name);
  const [timezone, setTimezone] = useState("UTC");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const roleBadgeColor: Record<Role, string> = {
    Admin: "var(--accent-blue)",
    Manager: "var(--accent-green)",
    Operator: "#D29922",
    Viewer: "var(--text-muted)",
  };

  const handleSaveName = () => {
    if (nameValue.trim()) {
      updateUser({ name: nameValue.trim() });
      setEditingName(false);
      toast({ title: "Name updated", variant: "success" });
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) return;
    if (newPw !== confirmPw) {
      toast({ title: "Passwords do not match", variant: "error" });
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast({ title: "Password updated successfully", variant: "success" });
  };

  return (
    <ToastProvider>
      <div style={{ maxWidth: "640px" }}>
          <h1 style={{ color: "var(--text-primary)", fontSize: "24px", fontWeight: 600, margin: "0 0 24px 0" }}>
            Profile
          </h1>

          {/* Avatar + basic info */}
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color: "white", fontSize: "22px", fontWeight: 600 }}>{user.initials}</span>
              </div>
              <div>
                {editingName ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      style={{
                        height: "32px",
                        padding: "0 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-default)",
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      style={{
                        height: "32px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "var(--accent-blue)",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setNameValue(user.name); }}
                      style={{
                        height: "32px",
                        padding: "0 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-default)",
                        backgroundColor: "transparent",
                        color: "var(--text-secondary)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 600 }}>{user.name}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-blue)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
                <div style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{user.email}</div>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "6px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: roleBadgeColor[user.role],
                    border: `1px solid ${roleBadgeColor[user.role]}30`,
                    backgroundColor: `${roleBadgeColor[user.role]}10`,
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => { setTimezone(e.target.value); toast({ title: "Timezone updated", variant: "success" }); }}
                style={{
                  height: "36px",
                  padding: "0 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-default)",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  minWidth: "200px",
                }}
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Password change */}
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 600, margin: "0 0 16px 0" }}>
              Change Password
            </h2>
            <form onSubmit={handleChangePassword}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Current password
                  </label>
                  <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    New password
                  </label>
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "4px" }}>
                    Confirm new password
                  </label>
                  <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <button
                    type="submit"
                    style={{
                      height: "36px", padding: "0 16px", borderRadius: "6px", border: "none",
                      backgroundColor: "var(--accent-blue)", color: "white", fontSize: "13px", fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    Update password
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Connected apps */}
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <h2 style={{ color: "var(--text-primary)", fontSize: "16px", fontWeight: 600, margin: "0 0 12px 0" }}>
              Connected Apps
            </h2>
            <div style={{ padding: "32px 16px", textAlign: "center", border: "1px dashed var(--border-default)", borderRadius: "6px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>No connected apps yet</p>
            </div>
          </div>
        </div>
      <Toaster toasts={toasts} dismiss={dismiss} />
    </ToastProvider>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "36px",
  padding: "0 10px",
  borderRadius: "6px",
  border: "1px solid var(--border-default)",
  backgroundColor: "var(--bg-primary)",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box" as const,
};
