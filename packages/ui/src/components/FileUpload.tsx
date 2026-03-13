import * as React from "react";
import { Upload, X, File, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

export interface FileUploadFile {
  file: File;
  id: string;
  error?: string;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  onFilesChange?: (files: FileUploadFile[]) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ accept, multiple, maxSizeMb, onFilesChange, disabled, className, label }: FileUploadProps) {
  const [files, setFiles] = React.useState<FileUploadFile[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const processFiles = (rawFiles: FileList) => {
    const maxBytes = maxSizeMb ? maxSizeMb * 1024 * 1024 : Infinity;
    const newFiles: FileUploadFile[] = Array.from(rawFiles).map((file) => ({
      file,
      id: Math.random().toString(36).slice(2),
      error: file.size > maxBytes ? `Exceeds ${maxSizeMb}MB limit` : undefined,
    }));
    const updated = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
          dragging ? "border-[var(--accent-blue)] bg-[var(--accent-blue)]/5" : "border-[var(--border-default)] hover:border-[var(--border-strong)]",
          disabled ? "opacity-50 cursor-not-allowed" : ""
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-[var(--text-muted)]" />
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Drop files here or click to upload</p>
          {(accept || maxSizeMb) && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {[accept && `Accepts: ${accept}`, maxSizeMb && `Max ${maxSizeMb}MB`].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="sr-only"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map(({ file, id, error }) => (
            <li key={id} className="flex items-center gap-3 rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] px-3 py-2">
              <File className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm truncate", error ? "text-[var(--accent-red)]" : "text-[var(--text-primary)]")}>{file.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{error ?? formatBytes(file.size)}</p>
              </div>
              {!error && <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)] shrink-0" />}
              <button onClick={() => removeFile(id)} aria-label="Remove file" className="text-[var(--text-muted)] hover:text-[var(--accent-red)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
