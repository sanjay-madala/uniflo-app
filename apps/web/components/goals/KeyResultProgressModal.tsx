"use client";

import { useState } from "react";
import type { KeyResult } from "@uniflo/mock-data";
import { Modal, Button, Input, Textarea, Badge } from "@uniflo/ui";
import { GoalProgressBar } from "./GoalProgressBar";
import { GoalStatusChip } from "./GoalStatusChip";
import { AutoUpdateBadge } from "./AutoUpdateBadge";
import { AlertTriangle } from "lucide-react";

interface KeyResultProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kr: KeyResult | null;
  onSave?: (krId: string, newValue: number, note: string) => void;
}

function formatValue(value: number, unit: string): string {
  switch (unit) {
    case "percent":
      return `${value}%`;
    case "currency":
      return `$${value.toLocaleString()}`;
    case "boolean":
      return value ? "Yes" : "No";
    case "score":
      return value.toFixed(1);
    default:
      return String(value);
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  return "Just now";
}

export function KeyResultProgressModal({
  open,
  onOpenChange,
  kr,
  onSave,
}: KeyResultProgressModalProps) {
  const [newValue, setNewValue] = useState<string>("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!kr) return null;

  const currentKR = kr;
  const lastHistory = currentKR.progress_history.slice(-5).reverse();

  function handleSave() {
    const parsed = parseFloat(newValue);
    if (isNaN(parsed)) {
      setError("Please enter a valid number");
      return;
    }
    if (currentKR.unit === "percent" && (parsed < 0 || parsed > 100)) {
      setError("Value must be between 0 and 100");
      return;
    }
    if (currentKR.unit === "boolean" && parsed !== 0 && parsed !== 1) {
      setError("Value must be 0 or 1");
      return;
    }
    setError(null);
    onSave?.(currentKR.id, parsed, note);
    setNewValue("");
    setNote("");
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Update Key Result Progress"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Update</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* KR Title */}
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{kr.title}</h3>

        {/* Current State Card */}
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] p-4">
          <div className="flex items-center justify-between mb-3">
            <AutoUpdateBadge
              trackingType={kr.tracking_type}
              moduleLabel={kr.data_source_module ? kr.data_source_module.charAt(0).toUpperCase() + kr.data_source_module.slice(1) : undefined}
            />
            <GoalStatusChip health={kr.health} />
          </div>

          <GoalProgressBar
            progress={kr.progress_pct}
            health={kr.health}
            label={`${kr.title}: ${formatValue(kr.current_value, kr.unit)} of ${formatValue(kr.target_value, kr.unit)}`}
          />

          <div className="grid grid-cols-4 gap-2 mt-3 text-xs">
            <div>
              <span className="text-[var(--text-muted)]">Baseline</span>
              <div className="font-medium text-[var(--text-primary)]">{formatValue(kr.start_value, kr.unit)}</div>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Current</span>
              <div className="font-medium text-[var(--text-primary)]">{formatValue(kr.current_value, kr.unit)}</div>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Target</span>
              <div className="font-medium text-[var(--text-primary)]">{formatValue(kr.target_value, kr.unit)}</div>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Direction</span>
              <div className="font-medium text-[var(--text-primary)] capitalize">{kr.direction}</div>
            </div>
          </div>

          {kr.last_auto_update && (
            <div className="mt-2 text-xs text-[var(--text-muted)]">
              Last updated: {timeAgo(kr.last_auto_update)}
              {kr.progress_history.length > 0 && ` (${kr.progress_history[kr.progress_history.length - 1].source_label})`}
            </div>
          )}
        </div>

        {/* Auto-tracked Warning */}
        {kr.tracking_type === "auto" && (
          <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-400">
              This KR is auto-tracked from {kr.data_source_module ? kr.data_source_module.charAt(0).toUpperCase() + kr.data_source_module.slice(1) : "operational data"}.
              Manual updates will be marked as overrides and may be replaced by the next auto-update.
            </p>
          </div>
        )}

        {/* Update Form */}
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
              New Value *
            </label>
            <Input
              type="number"
              value={newValue}
              onChange={(e) => {
                setNewValue(e.target.value);
                setError(null);
              }}
              placeholder={String(kr.current_value)}
              step={kr.unit === "score" ? "0.1" : "1"}
            />
            {error && <p className="text-xs text-[var(--accent-red)] mt-1">{error}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-primary)] mb-1 block">
              Note (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for this update..."
              rows={2}
              maxLength={500}
            />
          </div>
        </div>

        {/* Progress History */}
        {lastHistory.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] mb-2">Recent History</h4>
            <div className="flex flex-col gap-1">
              {lastHistory.map((entry) => {
                const delta = entry.value - entry.previous_value;
                const deltaStr = delta > 0 ? `+${delta}` : String(delta);
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-[var(--border-default)] last:border-0"
                  >
                    <span className="text-[var(--text-muted)]">
                      {new Date(entry.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <span className="text-[var(--text-primary)] font-medium">
                      {formatValue(entry.value, kr.unit)}
                    </span>
                    <span className={delta > 0 ? "text-[var(--accent-green)]" : delta < 0 ? "text-[var(--accent-red)]" : "text-[var(--text-muted)]"}>
                      ({deltaStr})
                    </span>
                    <Badge variant={entry.source === "auto" ? "blue" : "default"}>
                      {entry.source === "auto" ? "Auto" : "Manual"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
