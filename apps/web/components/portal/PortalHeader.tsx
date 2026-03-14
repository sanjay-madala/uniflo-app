"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";

interface PortalHeaderProps {
  title?: string;
  customerName?: string;
  customerEmail?: string;
  backLabel?: string;
  backHref?: string;
}

export function PortalHeader({
  title = "My Support Portal",
  customerName = "Jamie Smith",
  customerEmail = "jamie.smith@example.com",
  backLabel,
  backHref,
}: PortalHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="flex h-16 items-center justify-between border-b px-6"
      style={{
        backgroundColor: "var(--portal-bg)",
        borderColor: "var(--portal-border)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
          style={{ backgroundColor: "var(--portal-accent)" }}
        >
          U
        </div>
        {backLabel && backHref ? (
          <a
            href={backHref}
            className="flex items-center gap-1 text-sm transition-colors"
            style={{ color: "var(--portal-accent)" }}
          >
            &larr; {backLabel}
          </a>
        ) : null}
      </div>

      <span
        className="text-sm font-semibold"
        style={{ color: "var(--portal-text-primary)" }}
      >
        {title}
      </span>

      <div className="relative">
        <button
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--portal-text-primary)" }}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {customerName}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border p-2 shadow-lg"
              style={{
                backgroundColor: "var(--portal-surface-elevated)",
                borderColor: "var(--portal-border)",
              }}
            >
              <div className="border-b px-3 py-2" style={{ borderColor: "var(--portal-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--portal-text-primary)" }}>
                  {customerName}
                </p>
                <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>
                  {customerEmail}
                </p>
              </div>
              <button
                className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:opacity-80"
                style={{ color: "var(--portal-danger)" }}
              >
                <LogOut className="h-3.5 w-3.5" />
                Log Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
