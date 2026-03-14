"use client";

import { Input, Textarea, Button } from "@uniflo/ui";
import { Trash2 } from "lucide-react";
import type { SLAPolicyStatus } from "@uniflo/mock-data";
import { PolicyStatusBadge } from "../PolicyStatusBadge";

interface PolicyBuilderSidebarProps {
  name: string;
  description: string;
  priorityOrder: number;
  status: SLAPolicyStatus;
  createdBy: string;
  errors: Record<string, string>;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriorityOrderChange: (value: number) => void;
  onDelete?: () => void;
}

export function PolicyBuilderSidebar({
  name,
  description,
  priorityOrder,
  status,
  createdBy,
  errors,
  onNameChange,
  onDescriptionChange,
  onPriorityOrderChange,
  onDelete,
}: PolicyBuilderSidebarProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Policy Name <span className="text-[var(--accent-red)]">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Critical Ticket Response"
          aria-invalid={!!errors.name}
          className={errors.name ? "border-[var(--accent-red)]" : ""}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-[var(--accent-red)]">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe what this policy covers..."
          rows={3}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Priority Order
        </label>
        <Input
          type="number"
          min={1}
          value={priorityOrder}
          onChange={(e) =>
            onPriorityOrderChange(Math.max(1, Number(e.target.value)))
          }
          className="w-20"
        />
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Lower = evaluated first for overlapping policies
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Created by
        </label>
        <p className="text-sm text-[var(--text-primary)]">{createdBy}</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Status
        </label>
        <PolicyStatusBadge status={status} />
      </div>

      {onDelete && (
        <>
          <div className="border-t border-[var(--border-default)] my-2" />
          <Button
            variant="secondary"
            size="sm"
            className="text-[var(--accent-red)]"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" /> Delete Policy
          </Button>
        </>
      )}
    </div>
  );
}
