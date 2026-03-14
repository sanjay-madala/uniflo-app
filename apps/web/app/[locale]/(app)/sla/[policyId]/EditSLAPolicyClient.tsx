"use client";

import { useParams } from "next/navigation";
import { slaPolicies } from "@uniflo/mock-data";
import type { SLAPolicy } from "@uniflo/mock-data";
import { PolicyBuilderForm } from "@/components/sla/PolicyBuilder/PolicyBuilderForm";
import { EmptyState } from "@uniflo/ui";
import { AlertTriangle } from "lucide-react";

export default function EditSLAPolicyClient() {
  const { policyId } = useParams<{ policyId: string }>();
  const policy = (slaPolicies as unknown as SLAPolicy[]).find(
    (p) => p.id === policyId
  );

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
