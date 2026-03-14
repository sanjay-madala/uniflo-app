"use client";

import { useState, useMemo } from "react";
import { Modal, Button, Checkbox } from "@uniflo/ui";
import { CheckCircle2, Paperclip } from "lucide-react";
import type { Broadcast } from "@uniflo/mock-data";
import { BroadcastPriorityBadge } from "./BroadcastPriorityBadge";

interface StaffAcknowledgmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broadcasts: Broadcast[];
}

export function StaffAcknowledgmentModal({
  open,
  onOpenChange,
  broadcasts,
}: StaffAcknowledgmentModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  // Sort: critical first, then urgent, then normal
  const sorted = useMemo(() => {
    const priorityOrder: Record<string, number> = { critical: 0, urgent: 1, normal: 2 };
    return [...broadcasts].sort(
      (a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
    );
  }, [broadcasts]);

  const current = sorted[currentIndex];
  const isCritical = current?.priority === "critical";

  const handleAcknowledge = () => {
    if (!current) return;
    setAcknowledgedIds((prev) => new Set(prev).add(current.id));
    if (currentIndex < sorted.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsChecked(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleSkip = () => {
    if (currentIndex < sorted.length - 1) {
      setCurrentIndex((i) => i + 1);
      setIsChecked(false);
    } else {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setCurrentIndex(0);
    setIsChecked(false);
    setIsComplete(false);
    onOpenChange(false);
  };

  if (!open) return null;

  if (isComplete) {
    return (
      <Modal open={open} onOpenChange={handleClose} title="Broadcasts Requiring Acknowledgment">
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="rounded-full bg-[color-mix(in_srgb,var(--accent-green)_15%,transparent)] p-4">
            <CheckCircle2 className="h-12 w-12 text-[var(--accent-green)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            All broadcasts acknowledged
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            You have no pending acknowledgments. Thank you for staying informed.
          </p>
          <Button onClick={handleClose}>Done</Button>
        </div>
      </Modal>
    );
  }

  if (!current) return null;

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      size="lg"
      title="Broadcasts Requiring Acknowledgment"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {!isCritical && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip for now
              </Button>
            )}
            {isCritical && (
              <span className="text-xs text-[var(--text-muted)]">
                This critical broadcast must be acknowledged.
              </span>
            )}
          </div>
          <Button onClick={handleAcknowledge} disabled={!isChecked}>
            {currentIndex < sorted.length - 1 ? "Acknowledge & Next" : "Acknowledge"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Progress */}
        <p className="text-xs text-[var(--text-secondary)]">
          {currentIndex + 1} of {sorted.length}
        </p>

        {/* Broadcast header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BroadcastPriorityBadge priority={current.priority} />
            <span className="text-xs text-[var(--text-muted)]">
              {current.sent_at
                ? new Date(current.sent_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">{current.title}</h3>

        {/* Body */}
        <div
          className="prose prose-sm max-w-none rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-4 text-[var(--text-primary)] max-h-[300px] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: current.body_html }}
        />

        {/* Attachments */}
        {current.attachments.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-[var(--text-secondary)]">Attachments:</p>
            {current.attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 text-sm text-[var(--accent-blue)]">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{att.name}</span>
                <span className="text-xs text-[var(--text-muted)]">({att.size})</span>
              </div>
            ))}
          </div>
        )}

        {/* Acknowledgment checkbox */}
        <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked === true)}
              className="mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                I have read and understood this broadcast
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                By acknowledging, you confirm you have read the above message and any attached
                documents. This acknowledgment is recorded for compliance purposes.
              </p>
            </div>
          </label>
        </div>
      </div>
    </Modal>
  );
}
