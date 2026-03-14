"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { List, LayoutGrid, GanttChart } from "lucide-react";

type ViewMode = "list" | "board" | "timeline";

function getActiveView(pathname: string): ViewMode {
  if (pathname.includes("/tasks/board")) return "board";
  return "list";
}

const views: Array<{ id: ViewMode; label: string; icon: typeof List; disabled?: boolean }> = [
  { id: "list", label: "List", icon: List },
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "timeline", label: "Timeline", icon: GanttChart, disabled: true },
];

export function TaskViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const active = getActiveView(pathname);

  function handleSwitch(view: ViewMode) {
    if (view === "timeline") return;
    const route = view === "board" ? `/${locale}/tasks/board` : `/${locale}/tasks`;
    router.push(route);
  }

  return (
    <div className="inline-flex h-9 items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)]">
      {views.map(view => {
        const isActive = active === view.id;
        const Icon = view.icon;

        if (view.disabled) {
          return (
            <div key={view.id} className="relative group">
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--text-muted)] cursor-not-allowed"
                aria-label={`${view.label} — Coming in Alpha`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
              <div className="pointer-events-none absolute top-full start-1/2 -translate-x-1/2 mt-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="rounded-md bg-[var(--bg-elevated,#21262D)] px-3 py-1.5 text-xs text-[var(--text-primary)] shadow-lg whitespace-nowrap">
                  Coming in Alpha
                </div>
              </div>
            </div>
          );
        }

        return (
          <button
            key={view.id}
            onClick={() => handleSwitch(view.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "text-[var(--accent-blue)] bg-[var(--accent-blue)]/10 font-medium"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}
