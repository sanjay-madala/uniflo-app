import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  shortcut?: string;
  className?: string;
}

export function SearchBar({ value = "", onChange, onClear, shortcut, className, placeholder = "Search…", ...props }: SearchBarProps) {
  const [internalValue, setInternalValue] = React.useState(value);
  const controlled = onChange !== undefined;
  const displayValue = controlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!controlled) setInternalValue(e.target.value);
    onChange?.(e.target.value);
  };

  const handleClear = () => {
    if (!controlled) setInternalValue("");
    onClear?.();
    onChange?.("");
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute start-3 h-4 w-4 text-[var(--text-muted)] pointer-events-none" aria-hidden="true" />
      <input
        type="search"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-9 ps-9 pe-16 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] focus:border-[var(--accent-blue)] transition-colors"
        {...props}
      />
      <div className="absolute end-3 flex items-center gap-1.5">
        {displayValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {shortcut && (
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-1 text-[10px] font-mono text-[var(--text-muted)]">
            {shortcut}
          </kbd>
        )}
      </div>
    </div>
  );
}
