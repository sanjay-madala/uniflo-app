"use client";

import { Switch } from "@uniflo/ui";

interface AcknowledgmentToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function AcknowledgmentToggle({ checked, onCheckedChange }: AcknowledgmentToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-[var(--text-secondary)]">Acknowledgment</label>
      <div className="flex items-center gap-3">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
        <span className="text-sm text-[var(--text-primary)]">Require staff acknowledgment</span>
      </div>
      {checked && (
        <p className="text-xs text-[var(--text-muted)]">
          Recipients must confirm they have read this message
        </p>
      )}
    </div>
  );
}
