"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { PageHeader, Card, CardContent, Badge } from "@uniflo/ui";
import {
  Tag,
  ClipboardCheck,
  ShieldAlert,
  CheckCircle2,
  FileText,
  LayoutGrid,
} from "lucide-react";

interface AnalyticsModuleLink {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const MODULES: AnalyticsModuleLink[] = [
  {
    title: "Ticket Analytics",
    description: "Volume, resolution times, SLA compliance, and category breakdown",
    href: "/analytics/tickets",
    icon: Tag,
    color: "var(--accent-blue)",
  },
  {
    title: "Audit Analytics",
    description: "Scores, pass rates, compliance heatmap, and findings trends",
    href: "/analytics/audits",
    icon: ClipboardCheck,
    color: "var(--accent-green)",
  },
  {
    title: "CAPA Analytics",
    description: "Closure rates, severity breakdown, recurrence, and effectiveness",
    href: "/analytics/capa",
    icon: ShieldAlert,
    color: "var(--accent-yellow)",
  },
  {
    title: "Task Analytics",
    description: "Velocity, completion trends, overdue rates, and team workload",
    href: "/analytics/tasks",
    icon: CheckCircle2,
    color: "var(--accent-purple)",
  },
  {
    title: "Custom Dashboard Builder",
    description: "Create personalized dashboards with drag-and-drop widgets",
    href: "/analytics/builder",
    icon: LayoutGrid,
    color: "var(--accent-blue)",
    badge: "Builder",
  },
  {
    title: "Saved Reports",
    description: "View and manage your scheduled and saved reports",
    href: "/analytics/reports",
    icon: FileText,
    color: "var(--text-muted)",
  },
];

export default function AnalyticsPage() {
  const { locale } = useParams<{ locale: string }>();

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Analytics"
        subtitle="Interactive charts and reports across all operational modules"
        className="px-0 py-0 border-0"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link key={mod.href} href={`/${locale}${mod.href}`}>
              <Card className="h-full hover:border-[var(--accent-blue)] transition-colors cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${mod.color}15` }}
                    >
                      <Icon size={20} style={{ color: mod.color }} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{mod.title}</p>
                        {mod.badge && <Badge variant="blue">{mod.badge}</Badge>}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
