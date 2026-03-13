"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import clsx from "clsx";

export interface InlineEditProps {
  value: string;
  onSave: (value: string) => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

export function InlineEdit({
  value: initialValue,
  onSave,
  onCancel,
  placeholder = "Click to edit",
  multiline = false,
  maxLength,
  disabled = false,
  className,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(value);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={clsx("flex items-gap-2", className)}>
        {multiline ? (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={isSaving}
            className={clsx(
              "flex-1 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm",
              "text-gray-100 placeholder-gray-500",
              "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            )}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={isSaving}
            className={clsx(
              "flex-1 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm",
              "text-gray-100 placeholder-gray-500",
              "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            )}
          />
        )}
        <button
          onClick={handleSave}
          disabled={isSaving || value === initialValue}
          className={clsx(
            "rounded p-1",
            "hover:bg-green-900/50",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Save"
        >
          <CheckIcon size={18} className="text-green-500" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className={clsx(
            "rounded p-1",
            "hover:bg-red-900/50",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Cancel"
        >
          <XIcon size={18} className="text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && setIsEditing(true)}
      className={clsx(
        "rounded px-2 py-1 cursor-pointer",
        !disabled && "hover:bg-gray-800",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          setIsEditing(true);
        }
      }}
    >
      {value || <span className="text-gray-500">{placeholder}</span>}
    </div>
  );
}
