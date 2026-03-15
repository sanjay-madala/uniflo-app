"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSLAComplianceData } from "@/lib/data/useSLAData";
import type { SLAItemStatus, SLAPolicy } from "@uniflo/mock-data";
import {
  PageHeader,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
} from "@uniflo/ui";
import { ArrowLeft, Clock } from "lucide-react";
import { OperationalSLATab } from "@/components/sla/OperationalSLATab";

// Mock item details for audits and CAPAs
const auditDetails = [
  { id: "aud_005", title: "Resort Food Safety Quarterly Audit", subtitle: "Food Safety", location: "Resort", dueDate: "Mar 12" },
  { id: "aud_007", title: "Airport Kitchen Inspection", subtitle: "Food Safety", location: "Airport", dueDate: "Mar 15" },
  { id: "aud_009", title: "Downtown Prep Area Inspection", subtitle: "Food Safety", location: "Downtown", dueDate: "Mar 15" },
  { id: "aud_002", title: "Store #12 Monthly Compliance", subtitle: "Monthly Compliance", location: "Downtown", dueDate: "Mar 16" },
];

const capaDetails = [
  { id: "capa_001", title: "Fix walk-in freezer temperature alarm", subtitle: "Audit", location: "Downtown", dueDate: "Mar 15" },
  { id: "capa_003", title: "Replace expired fire extinguishers", subtitle: "Audit", location: "Airport", dueDate: "Mar 13" },
  { id: "capa_002", title: "Update POS backup procedure", subtitle: "Audit", location: "Downtown", dueDate: "Mar 17" },
];

export default function OperationalSLAPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const { itemStatuses: slaItemStatuses, policies: slaPolicies, isLoading, error } = useSLAComplianceData();
  const [activeTab, setActiveTab] = useState<string>("audits");

  const allItems = slaItemStatuses as unknown as SLAItemStatus[];
  const policies = slaPolicies as unknown as SLAPolicy[];

  const auditItems = useMemo(
    () => allItems.filter((s) => s.module === "audits"),
    [allItems]
  );
  const capaItems = useMemo(
    () => allItems.filter((s) => s.module === "capa"),
    [allItems]
  );

  const auditPolicy = policies.find((p) => p.module === "audits" && p.status === "active");
  const capaPolicy = policies.find((p) => p.module === "capa" && p.status === "active");

  const hasOperationalPolicies = auditPolicy || capaPolicy;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="space-y-3 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load operational SLA data: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Operational SLA"
        subtitle="SLA tracking for audits and corrective actions"
        actions={
          <Link href={`/${locale}/sla/`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" /> Policies
            </Button>
          </Link>
        }
        className="px-0 py-0 border-0"
      />

      {!hasOperationalPolicies ? (
        <EmptyState
          icon={<Clock className="h-6 w-6" />}
          title="No operational SLA policies configured"
          description="Create an SLA policy for audits or CAPAs to track completion deadlines."
          action={{
            label: "Create Policy",
            onClick: () => router.push(`/${locale}/sla/new/`),
          }}
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="audits">Audits</TabsTrigger>
            <TabsTrigger value="capa">CAPA</TabsTrigger>
          </TabsList>

          <TabsContent value="audits">
            <OperationalSLATab
              module="audits"
              items={auditItems}
              itemDetails={auditDetails}
              linkedPolicyName={auditPolicy?.name ?? "N/A"}
              linkedPolicyId={auditPolicy?.id ?? ""}
            />
          </TabsContent>

          <TabsContent value="capa">
            <OperationalSLATab
              module="capa"
              items={capaItems}
              itemDetails={capaDetails}
              linkedPolicyName={capaPolicy?.name ?? "N/A"}
              linkedPolicyId={capaPolicy?.id ?? ""}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
