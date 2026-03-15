"use client";

import { useRouter, useParams } from "next/navigation";
import { useAutomationRuleData } from "@/lib/data/useWorkflowData";
import type { AutomationRule } from "@uniflo/mock-data";
import { RuleBuilderCanvas } from "@/components/workflow/RuleBuilder/RuleBuilderCanvas";
import type { RuleBuilderState } from "@/components/workflow/RuleBuilder/RuleBuilderCanvas";
import { PageHeader } from "@uniflo/ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditRuleClient() {
  const { locale, ruleId } = useParams<{ locale: string; ruleId: string }>();
  const router = useRouter();
  const { rule: existingRule, isLoading, error } = useAutomationRuleData(ruleId);

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
      <div className="flex flex-col gap-4 p-6">
        <div className="rounded-lg border border-[var(--accent-red)] bg-[var(--bg-secondary)] p-4">
          <p className="text-sm text-[var(--accent-red)]">Failed to load rule: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!existingRule) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <PageHeader
          title="Rule Not Found"
          subtitle="This automation rule could not be found."
          breadcrumb={
            <Link href={`/${locale}/workflow/`} className="text-sm text-[var(--accent-blue)] hover:underline">
              <ArrowLeft className="inline h-3 w-3 mr-1" />Rules
            </Link>
          }
          className="px-0 py-0 border-0"
        />
      </div>
    );
  }

  function handleSaveDraft(_state: RuleBuilderState) {
    router.push(`/${locale}/workflow/${ruleId}/`);
  }

  function handlePublish(_state: RuleBuilderState) {
    router.push(`/${locale}/workflow/${ruleId}/`);
  }

  function handleBack() {
    router.push(`/${locale}/workflow/${ruleId}/`);
  }

  function handleDelete() {
    // Mock: in production would call API
    router.push(`/${locale}/workflow/`);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <RuleBuilderCanvas
        existingRule={existingRule}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDelete={handleDelete}
        onBack={handleBack}
      />
    </div>
  );
}
