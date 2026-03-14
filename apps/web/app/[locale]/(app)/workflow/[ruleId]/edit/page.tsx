"use client";

import { useRouter, useParams } from "next/navigation";
import { automationRules as mockRules } from "@uniflo/mock-data";
import type { AutomationRule } from "@uniflo/mock-data";
import { RuleBuilderCanvas } from "@/components/workflow/RuleBuilder/RuleBuilderCanvas";
import type { RuleBuilderState } from "@/components/workflow/RuleBuilder/RuleBuilderCanvas";
import { PageHeader } from "@uniflo/ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() { return [{ruleId:"rule_001"},{ruleId:"rule_002"},{ruleId:"rule_003"}] }

export default function EditRulePage() {
  const { locale, ruleId } = useParams<{ locale: string; ruleId: string }>();
  const router = useRouter();

  const existingRule = (mockRules as AutomationRule[]).find(r => r.id === ruleId);

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
