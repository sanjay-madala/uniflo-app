"use client";

import { useParams } from "next/navigation";
import { useSLAPolicyData } from "@/lib/data/useSLAData";
import type { SLAPolicy } from "@uniflo/mock-data";
import { PolicyBuilderForm } from "@/components/sla/PolicyBuilder/PolicyBuilderForm";
import { EmptyState } from "@uniflo/ui";
import { AlertTriangle } from "lucide-react";

export default function EditSLAPolicyClient() {
  const { policyId } = useParams<{ policyId: string }>();
  const { policy, isLoading, error } = useSLAPolicyData(policyId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 rounded bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-64 rounded bg-[var(--bg-tertiary)] animate-pulse mt-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" />}
          title="Failed to load policy"
          description={error.message}
        />
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" />}
          title="Policy not found"
          description={`No SLA policy found with ID "${policyId}".`}
        />
      </div>
    );
  }

  return <PolicyBuilderForm existingPolicy={policy} />;
}
