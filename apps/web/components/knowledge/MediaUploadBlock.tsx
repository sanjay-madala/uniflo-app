"use client";

import { CloudUpload } from "lucide-react";

interface MediaUploadBlockProps {
  onUpload?: (file: File) => void;
}

export function MediaUploadBlock({ onUpload }: MediaUploadBlockProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-primary)] p-8 transition-colors hover:border-[var(--accent-blue)] hover:bg-[var(--bg-tertiary)] cursor-pointer"
      onClick={() => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/jpeg,image/png,image/gif,image/webp";
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) onUpload?.(file);
        };
        input.click();
      }}
    >
      <CloudUpload className="h-12 w-12 text-[var(--text-muted)]" />
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Drag & drop an image here
        </p>
        <p className="text-xs text-[var(--text-muted)]">or click to browse</p>
      </div>
      <p className="text-xs text-[var(--text-muted)]">
        Supported: JPG, PNG, GIF, WebP &middot; Max size: 5 MB
      </p>
    </div>
  );
}
