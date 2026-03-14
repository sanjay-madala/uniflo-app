"use client";

import {
  Input,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Switch,
  Button,
} from "@uniflo/ui";
import { Trash2 } from "lucide-react";
import type { SLATarget, SLATimeUnit } from "@uniflo/mock-data";

interface TargetRowProps {
  target: SLATarget;
  onUpdate: (updates: Partial<SLATarget>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function TargetRow({
  target,
  onUpdate,
  onRemove,
  canRemove,
}: TargetRowProps) {
  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-tertiary)] p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-[var(--text-primary)]">
          {target.label}
        </h4>
        {canRemove && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onRemove}
            aria-label={`Remove ${target.label} target`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">Target:</label>
          <Input
            type="number"
            min={1}
            value={target.target_value}
            onChange={(e) =>
              onUpdate({ target_value: Math.max(1, Number(e.target.value)) })
            }
            className="w-20"
          />
          <Select
            value={target.target_unit}
            onValueChange={(v) => onUpdate({ target_unit: v as SLATimeUnit })}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutes">minutes</SelectItem>
              <SelectItem value="hours">hours</SelectItem>
              <SelectItem value="days">days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={target.business_hours_only}
            onCheckedChange={(checked) =>
              onUpdate({ business_hours_only: checked })
            }
            aria-label="Business hours only"
          />
          <label className="text-xs text-[var(--text-secondary)]">
            Business hours only
          </label>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <label className="text-xs text-[var(--text-secondary)]">Warn at</label>
        <Input
          type="number"
          min={50}
          max={95}
          value={target.warning_threshold_percent}
          onChange={(e) =>
            onUpdate({
              warning_threshold_percent: Math.min(
                95,
                Math.max(50, Number(e.target.value))
              ),
            })
          }
          className="w-16"
        />
        <span className="text-xs text-[var(--text-secondary)]">% elapsed</span>
      </div>
    </div>
  );
}
