import * as React from "react";
import { cn } from "../lib/utils";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  hint?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, prefixIcon, suffixIcon, hint, className, id, ...props }, ref) => {
    const inputId = id ?? React.useId();

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <span className="absolute start-3 flex items-center text-[var(--text-muted)]">
              {prefixIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-9 rounded-md border bg-[var(--bg-primary)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors",
              "focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] focus:border-[var(--accent-blue)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-[var(--accent-red)] focus:ring-[var(--accent-red)]" : "border-[var(--border-default)]",
              prefixIcon ? "ps-9" : "",
              suffixIcon ? "pe-9" : "",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {suffixIcon && (
            <span className="absolute end-3 flex items-center text-[var(--text-muted)]">
              {suffixIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[var(--accent-red)]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--text-muted)]">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
TextField.displayName = "TextField";
