"use client";

import { useRouter, useParams } from "next/navigation";
import { RuleBuilderCanvas } from "@/components/workflow/RuleBuilder/RuleBuilderCanvas";
import type { RuleBuilderState } from "@/components/workflow/RuleBuilder/RuleBuilderCanvas";

export default function NewRulePage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  function handleSaveDraft(_state: RuleBuilderState) {
    // Mock: in production this would persist to API
    router.push(`/${locale}/workflow/`);
  }

  function handlePublish(_state: RuleBuilderState) {
    // Mock: in production this would persist to API and activate the rule
    router.push(`/${locale}/workflow/`);
  }

  function handleBack() {
    router.push(`/${locale}/workflow/`);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <RuleBuilderCanvas
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onBack={handleBack}
      />
    </div>
  );
}
