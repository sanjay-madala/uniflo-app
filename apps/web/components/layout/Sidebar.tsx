"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Ticket, FileText, ClipboardCheck, AlertTriangle,
  CheckSquare, BarChart2, Clock, BookOpen, Zap,
  Target, Users, MessageSquare, GraduationCap, Settings,
  ChevronLeft, Menu, Shield, UserCog,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/tickets", icon: Ticket, label: "Tickets" },
  { href: "/sops", icon: FileText, label: "SOPs" },
  { href: "/audit", icon: ClipboardCheck, label: "Audits" },
  { href: "/capa", icon: AlertTriangle, label: "CAPA" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/sla", icon: Clock, label: "SLA" },
  { href: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
  { href: "/workflow", icon: Zap, label: "Workflow" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/customer", icon: Users, label: "Customer Portal" },
  { href: "/comms", icon: MessageSquare, label: "Communications" },
  { href: "/training", icon: GraduationCap, label: "Training" },
];

export function Sidebar({ locale }: { locale: string }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("uniflo-sidebar-collapsed") === "true";
    }
    return false;
  });
  const pathname = usePathname();

  useEffect(() => {
    localStorage.setItem("uniflo-sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <aside
      style={{
        width: collapsed ? "60px" : "240px",
        transition: "width 0.2s ease",
        backgroundColor: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-default)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? "16px 12px" : "16px",
          borderBottom: "1px solid var(--border-muted)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minHeight: "56px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "6px",
            background: "linear-gradient(135deg, #58A6FF 0%, #388BFD 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "white", fontSize: "14px", fontWeight: 700 }}>U</span>
        </div>
        {!collapsed && (
          <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "16px", whiteSpace: "nowrap" }}>
            Uniflo
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px", overflowY: "auto", overflowX: "hidden" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}/`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "8px 12px" : "8px 10px",
                marginBottom: "2px",
                borderRadius: "6px",
                textDecoration: "none",
                backgroundColor: isActive ? "rgba(88,166,255,0.1)" : "transparent",
                color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                transition: "background-color 0.15s ease",
              }}
            >
              <Icon size={18} style={{ flexShrink: 0, color: isActive ? "var(--accent-blue)" : "var(--text-muted)" }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Admin section */}
        <div style={{ height: "1px", backgroundColor: "var(--border-muted)", margin: "8px 4px" }} />
        {!collapsed && (
          <div style={{ padding: "4px 10px 4px", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Admin
          </div>
        )}
        {[
          { href: "/admin/users", icon: UserCog, label: "Users" },
          { href: "/admin/roles", icon: Shield, label: "Roles" },
          { href: "/admin/settings", icon: Settings, label: "Settings" },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}/`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "8px 12px" : "8px 10px",
                marginBottom: "2px",
                borderRadius: "6px",
                textDecoration: "none",
                backgroundColor: isActive ? "rgba(88,166,255,0.1)" : "transparent",
                color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
                transition: "background-color 0.15s ease",
              }}
            >
              <Icon size={18} style={{ flexShrink: 0, color: isActive ? "var(--accent-blue)" : "var(--text-muted)" }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: "12px 8px", borderTop: "1px solid var(--border-muted)" }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-end",
            width: "100%",
            padding: "6px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            borderRadius: "4px",
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
