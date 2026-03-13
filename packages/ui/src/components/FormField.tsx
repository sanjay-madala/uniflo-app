import React, { ReactNode } from "react";
import clsx from "clsx";

export interface FormFieldProps {
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  error,
  description,
  required,
  disabled,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={clsx("space-y-2", className)}>
      {label && (
        <label
          className={clsx(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            disabled && "opacity-70 cursor-not-allowed"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div>{children}</div>
      {description && !error && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
