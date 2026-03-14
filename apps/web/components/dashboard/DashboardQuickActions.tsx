"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@uniflo/ui";
import { ClipboardCheck, Tag, ShieldAlert, CheckCircle2 } from "lucide-react";

const ACTIONS = [
  { label: "Start Audit", icon: ClipboardCheck, href: "/audit", color: "var(--accent-green)" },
  { label: "Create Ticket", icon: Tag, href: "/tickets", color: "var(--accent-blue)" },
  { label: "View CAPAs", icon: ShieldAlert, href: "/capa", color: "var(--accent-yellow)" },
  { label: "Open Tasks", icon: CheckCircle2, href: "/tasks", color: "var(--accent-purple)" },
];

export function DashboardQuickActions() {
  const { locale } = useParams<{ locale: string }>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-[var(--text-primary)]">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={`/${locale}${action.href}`}>
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-2 h-10"
                >
                  <Icon size={16} style={{ color: action.color }} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
