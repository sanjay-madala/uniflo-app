import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel} disabled={loading}>{cancelLabel}</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-red)]/10">
          <AlertTriangle className="h-6 w-6 text-[var(--accent-red)]" />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
    </Modal>
  );
}
