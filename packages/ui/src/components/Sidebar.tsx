import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  active?: boolean;
  badge?: string | number;
  onClick?: () => void;
}

export interface SidebarNavGroup {
  id: string;
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarProps {
  groups: SidebarNavGroup[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  className?: string;
  dir?: "ltr" | "rtl";
}

export function Sidebar({ groups, collapsed = false, onCollapsedChange, className, dir = "ltr" }: SidebarProps) {
  return (
    <div
      dir={dir}
      className={cn(
        "flex flex-col h-full bg-[var(--bg-secondary)] border-e border-[var(--border-default)] transition-all duration-300",
        collapsed ? "w-14" : "w-60",
        className
      )}
    >
      {/* Collapse toggle */}
      <div className={cn("flex items-center h-14 border-b border-[var(--border-default)] px-3", collapsed ? "justify-center" : "justify-end")}>
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="p-1.5 rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {dir === "rtl" ? (
            collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {groups.map((group) => (
          <div key={group.id}>
            {group.label && !collapsed && (
              <p className="px-4 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {group.label}
              </p>
            )}
            <ul role="list" className="space-y-0.5 px-2">
              {group.items.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={item.onClick}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                      collapsed ? "justify-center" : "justify-start",
                      item.active
                        ? "bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                    )}
                    aria-current={item.active ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon && (
                      <span className="shrink-0 h-4 w-4 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    {!collapsed && (
                      <span className="flex-1 truncate text-start">{item.label}</span>
                    )}
                    {!collapsed && item.badge !== undefined && (
                      <span className="ms-auto shrink-0 rounded-full bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
