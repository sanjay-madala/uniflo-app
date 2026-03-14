"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { KPICard } from "@uniflo/ui";
import type { DashboardKPI } from "@uniflo/mock-data";

interface DashboardKPIRowProps {
  kpis: DashboardKPI[];
}

export function DashboardKPIRow({ kpis }: DashboardKPIRowProps) {
  const { locale } = useParams<{ locale: string }>();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => (
        <Link
          key={kpi.id}
          href={`/${locale}${kpi.linkTo ?? "/dashboard"}`}
          className="block focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] rounded-lg"
          aria-label={`${kpi.title}: ${kpi.value}${kpi.unit ? ` ${kpi.unit}` : ""}, ${kpi.trend > 0 ? "up" : "down"} ${Math.abs(kpi.trend)}% ${kpi.trendLabel}`}
        >
          <KPICard
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            trend={kpi.trend}
            trendLabel={kpi.trendLabel}
            sparklineData={kpi.sparklineData}
            color={kpi.color}
            isPositive={kpi.isPositive}
            className="cursor-pointer hover:border-[var(--accent-blue)] transition-colors h-full"
          />
        </Link>
      ))}
    </div>
  );
}
