"use client";

import { useState, useEffect, useRef } from "react";
import { WifiOff, RefreshCw, Check } from "lucide-react";

type BannerState = "hidden" | "offline" | "syncing" | "synced";

export function OfflineBanner() {
  const [state, setState] = useState<BannerState>("hidden");
  const [pendingChanges, setPendingChanges] = useState(0);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleOffline() {
      setState("offline");
      // Mock: track pending changes count
      setPendingChanges((prev) => (prev === 0 ? 1 : prev));
    }

    function handleOnline() {
      if (pendingChanges > 0) {
        setState("syncing");
        // Simulate sync
        setTimeout(() => {
          setState("synced");
          setPendingChanges(0);
          dismissTimerRef.current = setTimeout(() => {
            setState("hidden");
          }, 3000);
        }, 1500);
      } else {
        setState("synced");
        dismissTimerRef.current = setTimeout(() => {
          setState("hidden");
        }, 3000);
      }
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Check initial state
    if (!navigator.onLine) {
      setState("offline");
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [pendingChanges]);

  if (state === "hidden") return null;

  const config: Record<
    Exclude<BannerState, "hidden">,
    {
      bg: string;
      border: string;
      color: string;
      icon: typeof WifiOff;
      text: string;
      spin: boolean;
    }
  > = {
    offline: {
      bg: "color-mix(in srgb, var(--accent-yellow) 15%, transparent)",
      border: "color-mix(in srgb, var(--accent-yellow) 40%, transparent)",
      color: "var(--accent-yellow)",
      icon: WifiOff,
      text: "Working offline — data will sync",
      spin: false,
    },
    syncing: {
      bg: "color-mix(in srgb, var(--accent-blue) 15%, transparent)",
      border: "color-mix(in srgb, var(--accent-blue) 40%, transparent)",
      color: "var(--accent-blue)",
      icon: RefreshCw,
      text: `Syncing ${pendingChanges} change${pendingChanges !== 1 ? "s" : ""}...`,
      spin: true,
    },
    synced: {
      bg: "color-mix(in srgb, var(--accent-green) 15%, transparent)",
      border: "color-mix(in srgb, var(--accent-green) 40%, transparent)",
      color: "var(--accent-green)",
      icon: Check,
      text: "All changes synced",
      spin: false,
    },
  };

  const current = config[state];
  const Icon = current.icon;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 45,
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        backgroundColor: current.bg,
        borderBottom: `1px solid ${current.border}`,
        color: current.color,
        fontSize: "13px",
        fontWeight: 500,
        animation: prefersReducedMotion
          ? "none"
          : "slideDown 200ms ease-out",
      }}
    >
      <Icon
        size={16}
        style={{
          animation:
            current.spin && !prefersReducedMotion
              ? "spin 1s linear infinite"
              : "none",
          flexShrink: 0,
        }}
      />
      <span>{current.text}</span>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
