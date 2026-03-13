import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, ArrowRight, Hash } from "lucide-react";
import { cn } from "../lib/utils";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  group?: string;
  onSelect: () => void;
}

export interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
}

export function CommandPalette({ open, onOpenChange, items, placeholder = "Search commands…" }: CommandPaletteProps) {
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);

  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q));
  }, [items, query]);

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((item) => {
      const g = item.group ?? "Commands";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    });
    return map;
  }, [filtered]);

  const flatFiltered = filtered;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, flatFiltered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter") {
      const item = flatFiltered[activeIdx];
      if (item) { item.onSelect(); onOpenChange?.(false); }
    }
  };

  React.useEffect(() => { setActiveIdx(0); }, [query]);
  React.useEffect(() => { if (!open) setQuery(""); }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed start-[50%] top-[20%] z-50 -translate-x-1/2 w-full max-w-xl rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onKeyDown={handleKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
            />
            <kbd className="hidden sm:flex h-5 items-center rounded border border-[var(--border-default)] bg-[var(--bg-tertiary)] px-1.5 text-[10px] font-mono text-[var(--text-muted)]">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Hash className="h-8 w-8 text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-muted)]">No results for &ldquo;{query}&rdquo;</p>
              </div>
            ) : (
              Array.from(groups.entries()).map(([group, groupItems]) => (
                <div key={group}>
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {group}
                  </p>
                  {groupItems.map((item) => {
                    const globalIdx = flatFiltered.indexOf(item);
                    const isActive = globalIdx === activeIdx;
                    return (
                      <button
                        key={item.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-start transition-colors",
                          isActive ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]" : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                        )}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        onClick={() => { item.onSelect(); onOpenChange?.(false); }}
                      >
                        {item.icon && <span className="shrink-0 text-[var(--text-muted)]">{item.icon}</span>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.label}</p>
                          {item.description && <p className="text-xs text-[var(--text-muted)]">{item.description}</p>}
                        </div>
                        {isActive && <ArrowRight className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return { open, setOpen };
}
