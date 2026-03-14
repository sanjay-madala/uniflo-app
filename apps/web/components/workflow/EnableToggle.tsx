"use client";

import { useState, useEffect, useCallback } from "react";
import { Switch } from "@uniflo/ui";
import type { RuleStatus } from "@uniflo/mock-data";

interface EnableToggleProps {
  ruleId: string;
  ruleName: string;
  status: RuleStatus;
  onToggle: (ruleId: string, enabled: boolean) => void;
}

export function EnableToggle({ ruleId, ruleName, status, onToggle }: EnableToggleProps) {
  const [toast, setToast] = useState<string | null>(null);
  const isChecked = status === "active";
  const isDisabled = status === "draft" || status === "error";

  const handleChange = useCallback(
    (checked: boolean) => {
      onToggle(ruleId, checked);
      setToast(checked ? "Rule activated." : "Rule paused. No new executions will fire.");
    },
    [ruleId, onToggle],
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const tooltipText =
    status === "draft"
      ? "Publish this rule before enabling."
      : status === "error"
        ? "Fix errors before re-enabling."
        : undefined;

  return (
    <div className="relative flex flex-col items-start gap-1">
      <div title={tooltipText}>
        <Switch
          checked={isChecked}
          onCheckedChange={handleChange}
          disabled={isDisabled}
          aria-label={`Enable rule ${ruleName}`}
        />
      </div>
      {toast && (
        <span className="absolute top-7 left-0 z-10 whitespace-nowrap rounded bg-[var(--bg-tertiary)] px-2 py-1 text-xs text-[var(--text-secondary)] shadow-md">
          {toast}
        </span>
      )}
    </div>
  );
}
