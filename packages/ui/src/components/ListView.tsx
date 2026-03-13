import * as React from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "../lib/utils";

export interface ListViewAction<T> {
  label: string;
  onClick: (item: T) => void;
  destructive?: boolean;
}

export interface ListViewColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  width?: string;
}

export interface ListViewProps<T extends { id: string }> {
  items: T[];
  columns: ListViewColumn<T>[];
  actions?: ListViewAction<T>[];
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function ListView<T extends { id: string }>({
  items,
  columns,
  actions,
  onRowClick,
  emptyState,
  className,
  dir,
}: ListViewProps<T>) {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  React.useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  if (items.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className={cn("rounded-lg border border-[var(--border-default)] overflow-hidden", className)} dir={dir}>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-4 px-4 py-3 transition-colors",
            idx % 2 === 0 ? "bg-[var(--bg-secondary)]" : "bg-[var(--bg-primary)]",
            onRowClick ? "cursor-pointer hover:bg-[var(--bg-tertiary)]" : "",
            idx < items.length - 1 ? "border-b border-[var(--border-muted)]" : ""
          )}
          onClick={() => onRowClick?.(item)}
        >
          {columns.map((col) => (
            <div key={col.key} className={cn("min-w-0", col.width ?? "flex-1")}>
              {col.render(item)}
            </div>
          ))}
          {actions && (
            <div className="ms-auto relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Row actions"
                aria-haspopup="true"
                aria-expanded={openMenu === item.id}
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {openMenu === item.id && (
                <div className="absolute end-0 top-full mt-1 z-50 min-w-[140px] rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] shadow-lg py-1">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => { action.onClick(item); setOpenMenu(null); }}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-start hover:bg-[var(--bg-tertiary)] transition-colors",
                        action.destructive ? "text-[var(--accent-red)]" : "text-[var(--text-primary)]"
                      )}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
