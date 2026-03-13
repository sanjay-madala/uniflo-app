"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import {
  CommandPalette,
  useCommandPalette,
  type CommandItem,
} from "@uniflo/ui";
import {
  LayoutDashboard, Ticket, FileText, ClipboardCheck, AlertTriangle,
  CheckSquare, BarChart2, Clock, BookOpen, Zap,
  Target, Users, MessageSquare, GraduationCap, Settings, User,
} from "lucide-react";

const commandItems = (locale: string, navigate: (path: string) => void): CommandItem[] => [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/dashboard/`) },
  { id: "tickets", label: "Tickets", icon: <Ticket size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/tickets/`) },
  { id: "sops", label: "SOPs", icon: <FileText size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/sop/`) },
  { id: "audits", label: "Audits", icon: <ClipboardCheck size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/audit/`) },
  { id: "capa", label: "CAPA", icon: <AlertTriangle size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/capa/`) },
  { id: "tasks", label: "Tasks", icon: <CheckSquare size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/tasks/`) },
  { id: "analytics", label: "Analytics", icon: <BarChart2 size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/analytics/`) },
  { id: "sla", label: "SLA", icon: <Clock size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/sla/`) },
  { id: "knowledge", label: "Knowledge Base", icon: <BookOpen size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/knowledge/`) },
  { id: "workflow", label: "Workflow", icon: <Zap size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/workflow/`) },
  { id: "goals", label: "Goals", icon: <Target size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/goals/`) },
  { id: "customer", label: "Customer Portal", icon: <Users size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/customer/`) },
  { id: "comms", label: "Communications", icon: <MessageSquare size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/comms/`) },
  { id: "training", label: "Training", icon: <GraduationCap size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/training/`) },
  { id: "settings", label: "Settings", icon: <Settings size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/settings/`) },
  { id: "profile", label: "Profile", icon: <User size={16} />, group: "Navigation", onSelect: () => navigate(`/${locale}/profile/`) },
];

export function AppShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const items = commandItems(locale, (path) => router.push(path));

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <Sidebar locale={locale} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar locale={locale} />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </main>
      </div>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        placeholder="Search pages..."
      />
    </div>
  );
}
