"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { KPICard } from "@uniflo/ui";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from "@uniflo/ui";
import type { SLAItemStatus, SLAModule } from "@uniflo/mock-data";
import { SLAIndicator } from "./SLAIndicator";

interface OperationalSLATabProps {
  module: SLAModule;
  items: SLAItemStatus[];
  itemDetails: Array<{
    id: string;
    title: string;
    subtitle: string;
    location: string;
    dueDate: string;
  }>;
  linkedPolicyName: string;
  linkedPolicyId: string;
}

export function OperationalSLATab({
  module,
  items,
  itemDetails,
  linkedPolicyName,
  linkedPolicyId,
}: OperationalSLATabProps) {
  const { locale } = useParams<{ locale: string }>();

  const totalItems = items.length;
  const overdueCount = items.filter((i) => i.overall_status === "breached").length;
  const completionRate =
    totalItems > 0
      ? ((totalItems - overdueCount) / totalItems) * 100
      : 100;

  const moduleRoute = module === "audits" ? "audit" : "capa";

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KPICard
          title={`Active ${module === "audits" ? "Audit" : "CAPA"} SLA Items`}
          value={totalItems}
          color="var(--accent-blue)"
        />
        <KPICard
          title={module === "audits" ? "Completion Rate" : "Resolution Rate"}
          value={`${completionRate.toFixed(1)}%`}
          color={completionRate > 90 ? "var(--accent-green)" : completionRate >= 70 ? "var(--accent-yellow)" : "var(--accent-red)"}
        />
        <KPICard
          title={`Overdue ${module === "audits" ? "Audits" : "CAPAs"}`}
          value={overdueCount}
          color={overdueCount > 0 ? "var(--accent-red)" : "var(--accent-green)"}
        />
      </div>

      {/* Items table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {module === "audits" ? "Audit Title" : "CAPA Title"}
              </TableHead>
              <TableHead>
                {module === "audits" ? "Template" : "Source"}
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>SLA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemDetails.map((detail) => {
              const itemStatus = items.find((i) => i.item_id === detail.id);
              const isOverdue = itemStatus?.overall_status === "breached";
              return (
                <TableRow key={detail.id}>
                  <TableCell>
                    <Link
                      href={`/${locale}/${moduleRoute}/${detail.id}/`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                    >
                      {detail.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {detail.subtitle}
                  </TableCell>
                  <TableCell className="text-sm text-[var(--text-secondary)]">
                    {detail.location}
                  </TableCell>
                  <TableCell>
                    {isOverdue ? (
                      <div>
                        <Badge
                          className="text-xs"
                          style={{ backgroundColor: "var(--accent-red)", color: "var(--text-on-accent)" }}
                        >
                          OVERDUE
                        </Badge>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          {detail.dueDate}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--text-secondary)]">
                        {detail.dueDate}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SLAIndicator itemStatus={itemStatus} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Linked policy */}
      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
        <span>Linked Policy: {linkedPolicyName}</span>
        <Link
          href={`/${locale}/sla/${linkedPolicyId}/`}
          className="text-[var(--accent-blue)] hover:underline"
        >
          View Policy
        </Link>
      </div>
    </div>
  );
}
