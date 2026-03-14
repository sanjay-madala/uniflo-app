"use client";

import { Input, Textarea, Button } from "@uniflo/ui";
import type { RuleStatus } from "@uniflo/mock-data";
import { RuleStatusBadge } from "../RuleStatusBadge";

const locationLabels: Record<string, string> = {
  loc_001: "Downtown",
  loc_002: "Airport",
  loc_003: "Resort",
};

const userNames: Record<string, string> = {
  usr_001: "Sarah Chen",
  usr_002: "Marcus Johnson",
  usr_003: "Priya Sharma",
  usr_004: "Tom Riley",
  usr_005: "Ana Kowalski",
};

interface RuleBuilderSidebarProps {
  name: string;
  description: string;
  locationScope: string[];
  createdBy: string;
  status: RuleStatus;
  errors: Record<string, string>;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onLocationToggle: (locationId: string) => void;
  onDelete?: () => void;
}

export function RuleBuilderSidebar({
  name,
  description,
  locationScope,
  createdBy,
  status,
  errors,
  onNameChange,
  onDescriptionChange,
  onLocationToggle,
  onDelete,
}: RuleBuilderSidebarProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Rule Name */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Rule Name *</label>
        <Input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Name this automation rule"
          className={errors.name ? "border-[var(--accent-red)]" : ""}
        />
        {errors.name && <p className="mt-1 text-xs text-[var(--accent-red)]">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Description</label>
        <Textarea
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          placeholder="Describe what this rule does..."
          rows={3}
        />
      </div>

      {/* Location Scope */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">Location Scope</label>
        <p className="mb-2 text-xs text-[var(--text-muted)]">
          {locationScope.length === 0 ? "All locations (default)" : `${locationScope.length} selected`}
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(locationLabels).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onLocationToggle(id)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                locationScope.includes(id)
                  ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                  : "border-[var(--border-default)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Created by</span>
          <span className="text-xs text-[var(--text-secondary)]">{userNames[createdBy] ?? createdBy}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Status</span>
          <RuleStatusBadge status={status} />
        </div>
      </div>

      {/* Divider + Delete */}
      {onDelete && (
        <>
          <div className="border-t border-[var(--border-default)]" />
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete Rule
          </Button>
        </>
      )}
    </div>
  );
}
