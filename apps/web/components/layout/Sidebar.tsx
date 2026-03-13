"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, ClipboardCheck, AlertTriangle,
  Ticket, Zap, BookOpen, BarChart2, CheckSquare,
  Clock, Smartphone, Target, Users, MessageSquare, GraduationCap,
  ChevronLeft, Menu
} from "lucide-react";

const modules = [
  { id: "01", href: "/dashboard", icon: LayoutDashboard, label: "Platform Foundation" },
  { id: "02", href: "/sop", icon: FileText, label: "SOP Management" },
  { id: "03", href: "/audit", icon: ClipboardCheck, label: "Audit & Compliance" },
  { id: "04", href: "/capa", icon: AlertTriangle, label: "CAPA" },
  { id: "05", href: "/tickets", icon: Ticket, label: "Ticket Management" },
  { id: "06", href: "/workflow", icon: Zap, label: "Workflow Automation" },
  { id: "07", href: "/knowledge", icon: BookOpen, label: "Knowledge Base" },
  { id: "08", href: "/analytics", icon: BarChart2, label: "Analytics & Reporting" },
  { id: "09", href: "/tasks", icon: CheckSquare, label: "Task Management" },
  { id: "10", href: "/sla", icon: Clock, label: "SLA Management" },
  { id: "11", href: "/mobile", icon: Smartphone, label: "Mobile Platform" },
  { id: "12", href: "/goals", icon: Target, label: "Goals & OKRs" },
  { id: "13", href: "/customer", icon: Users, label: "Customer Portal" },
  { id: "14", href: "/comms", icon: MessageSquare, label: "Communication" },
  { id: "15", href: "/training", icon: GraduationCap, label: "Training & LMS" },
];

export function Sidebar({ locale }: { locale: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "240px",
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
      <div style={{ padding: "16px", borderBottom: "1px solid var(--border-muted)", display: "flex", alignItems: "center", gap: "12px", minHeight: "56px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "4px", background: "var(--accent-blue)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>U</span>
        </div>
        {!collapsed && <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "15px", whiteSpace: "nowrap" }}>Uniflo</span>}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "8px", overflowY: "auto", overflowX: "hidden" }}>
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = pathname.includes(mod.href);
          return (
            <Link
              key={mod.id}
              href={`/${locale}${mod.href}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: collapsed ? "8px" : "8px 10px",
                marginBottom: "2px",
                borderRadius: "4px",
                textDecoration: "none",
                backgroundColor: isActive ? "var(--bg-tertiary)" : "transparent",
                color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                fontSize: "13px",
                fontWeight: isActive ? 500 : 400,
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              <Icon size={16} style={{ flexShrink: 0, color: isActive ? "var(--accent-blue)" : "var(--text-muted)" }} />
              {!collapsed && <span>{mod.label}</span>}
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
        >
          {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
