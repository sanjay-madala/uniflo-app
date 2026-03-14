"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
}

interface FileUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploader({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSizeMb = 10,
}: FileUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      setError(null);
      const newFiles: UploadedFile[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (files.length + newFiles.length >= maxFiles) {
          setError(`Maximum ${maxFiles} files allowed.`);
          break;
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`File type "${file.type}" is not accepted.`);
          continue;
        }
        if (file.size > maxSizeMb * 1024 * 1024) {
          setError(`File "${file.name}" exceeds ${maxSizeMb}MB limit.`);
          continue;
        }
        newFiles.push({
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          progress: 100,
        });
      }

      if (newFiles.length > 0) {
        onFilesChange([...files, ...newFiles]);
      }
    },
    [files, maxFiles, maxSizeMb, onFilesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const isImage = (type: string) => type.startsWith("image/");

  return (
    <div className="space-y-3">
      <div
        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors"
        style={{
          borderColor: dragOver ? "var(--portal-accent)" : "var(--portal-border)",
          backgroundColor: dragOver ? "rgba(37,99,235,0.05)" : "transparent",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Upload
          className="mb-2 h-8 w-8"
          style={{ color: "var(--portal-text-muted)" }}
        />
        <p className="text-sm" style={{ color: "var(--portal-text-secondary)" }}>
          Drag and drop files here, or{" "}
          <button
            type="button"
            className="font-medium underline"
            style={{ color: "var(--portal-accent)" }}
            onClick={() => inputRef.current?.click()}
          >
            browse files
          </button>
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--portal-text-muted)" }}>
          Images, PDFs, documents. Max {maxSizeMb}MB per file, {maxFiles} files total.
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="text-xs" style={{ color: "var(--portal-danger)" }}>
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
              style={{
                borderColor: "var(--portal-border)",
                backgroundColor: "var(--portal-surface)",
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: "rgba(37,99,235,0.1)" }}
              >
                {isImage(file.type) ? (
                  <ImageIcon className="h-5 w-5" style={{ color: "var(--portal-accent)" }} />
                ) : (
                  <FileText className="h-5 w-5" style={{ color: "var(--portal-accent)" }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: "var(--portal-text-primary)" }}
                >
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
                  {file.size}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="shrink-0 rounded-md p-1 transition-colors hover:opacity-70"
                style={{ color: "var(--portal-text-muted)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
