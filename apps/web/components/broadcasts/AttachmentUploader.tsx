"use client";

import { Paperclip, X } from "lucide-react";
import type { BroadcastAttachment } from "@uniflo/mock-data";

interface AttachmentUploaderProps {
  attachments: BroadcastAttachment[];
  onRemove: (id: string) => void;
}

export function AttachmentUploader({ attachments, onRemove }: AttachmentUploaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center justify-center gap-2 rounded-md border border-dashed border-[var(--border-default)] p-4 text-sm text-[var(--text-muted)] cursor-pointer hover:border-[var(--accent-blue)] transition-colors"
      >
        <Paperclip className="h-4 w-4" />
        <span>Drop files or click to browse (max 10MB each, up to 5 files)</span>
      </div>
      {attachments.length > 0 && (
        <div className="flex flex-col gap-1">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center justify-between rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <Paperclip className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span className="text-[var(--text-primary)]">{att.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{att.size}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(att.id)}
                className="rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors"
                aria-label={`Remove ${att.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
