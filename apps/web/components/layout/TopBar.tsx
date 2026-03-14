"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, ChevronRight, ChevronDown, User, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { ThemeToggle } from "./ThemeToggle";

const roles = ["Admin", "Manager", "Field Staff"];

export function TopBar({ locale }: { locale: string }) {
  const { user, role, setRole, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const breadcrumbs = buildBreadcrumbs(pathname, locale);

  const currentRoleLabel = roles.find(r => r.toLowerCase().replace(' ', '_') === role) ||
    role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div style={{ flexShrink: 0 }}>
      {/* Top bar */}
      <header
        style={{
          height: "56px",
          borderBottom: "1px solid var(--border-default)",
          backgroundColor: "var(--bg-primary)",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: "16px",
        }}
      >
        {/* Search trigger */}
        <button
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "32px",
            padding: "0 12px",
            borderRadius: "6px",
            border: "1px solid var(--border-default)",
            backgroundColor: "var(--bg-secondary)",
            cursor: "pointer",
            color: "var(--text-muted)",
            fontSize: "13px",
            minWidth: "200px",
          }}
        >
          <Search size={14} />
          <span style={{ flex: 1, textAlign: "left" }}>Search...</span>
          <kbd
            style={{
              fontSize: "10px",
              padding: "1px 5px",
              borderRadius: "3px",
              border: "1px solid var(--border-default)",
              backgroundColor: "var(--bg-tertiary)",
              fontFamily: "monospace",
              color: "var(--text-muted)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        <div style={{ flex: 1 }} />

        {/* Org name */}
        <span style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>{user.org}</span>

        {/* Role switcher */}
        <div ref={roleRef} style={{ position: "relative" }}>
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "30px",
              padding: "0 10px",
              borderRadius: "6px",
              border: "1px solid var(--border-default)",
              backgroundColor: "var(--bg-secondary)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            <Shield size={13} style={{ color: "var(--accent-blue)" }} />
            {currentRoleLabel}
            <ChevronDown size={12} />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "4px",
                width: "160px",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                overflow: "hidden",
                zIndex: 50,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                padding: "4px",
              }}
            >
              {roles.map((r) => {
                const value = r.toLowerCase().replace(' ', '_');
                const isActive = role === value;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(value);
                      setRoleDropdownOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "7px 10px",
                      background: isActive ? "rgba(88,166,255,0.1)" : "none",
                      border: "none",
                      cursor: "pointer",
                      color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                      fontSize: "13px",
                      borderRadius: "4px",
                      textAlign: "left",
                      fontWeight: isActive ? 500 : 400,
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <div style={{ position: "relative" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <span
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-red)",
              color: "white",
              fontSize: "9px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            3
          </span>
        </div>

        {/* User avatar + dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>{user.initials}</span>
            </div>
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "4px",
                width: "200px",
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                borderRadius: "8px",
                overflow: "hidden",
                zIndex: 50,
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-muted)" }}>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)" }}>{user.name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{user.email}</div>
              </div>
              <div style={{ padding: "4px" }}>
                <DropdownItem icon={<User size={14} />} label="Profile" onClick={() => { setDropdownOpen(false); router.push(`/${locale}/profile/`); }} />
                <DropdownItem icon={<Settings size={14} />} label="Settings" onClick={() => { setDropdownOpen(false); router.push(`/${locale}/admin/settings/`); }} />
                <div style={{ height: "1px", backgroundColor: "var(--border-muted)", margin: "4px 0" }} />
                <DropdownItem icon={<LogOut size={14} />} label="Sign out" onClick={() => { setDropdownOpen(false); logout(); router.push(`/${locale}/login/`); }} />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div
          style={{
            padding: "8px 24px",
            borderBottom: "1px solid var(--border-muted)",
            backgroundColor: "var(--bg-primary)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
          }}
        >
          {breadcrumbs.map((crumb, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {i > 0 && <ChevronRight size={12} style={{ color: "var(--text-muted)" }} />}
              <span
                style={{
                  color: i === breadcrumbs.length - 1 ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                }}
              >
                {crumb}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "100%",
        padding: "8px 12px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--text-secondary)",
        fontSize: "13px",
        borderRadius: "4px",
        textAlign: "left",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <span style={{ color: "var(--text-muted)", display: "flex" }}>{icon}</span>
      {label}
    </button>
  );
}

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  tickets: "Tickets",
  sop: "SOPs",
  audit: "Audits",
  capa: "CAPA",
  tasks: "Tasks",
  analytics: "Analytics",
  sla: "SLA",
  knowledge: "Knowledge Base",
  workflow: "Workflow",
  goals: "Goals",
  customer: "Customer Portal",
  comms: "Communications",
  training: "Training",
  settings: "Settings",
  profile: "Profile",
  admin: "Admin",
  users: "Users",
  roles: "Roles",
};

function buildBreadcrumbs(pathname: string, locale: string): string[] {
  const stripped = pathname.replace(`/${locale}`, "").replace(/^\/+|\/+$/g, "");
  if (!stripped) return ["Home"];
  const segments = stripped.split("/");
  return ["Home", ...segments.map((s) => routeLabels[s] || s.charAt(0).toUpperCase() + s.slice(1))];
}
