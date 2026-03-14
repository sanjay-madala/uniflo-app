"use client";

import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const ACTIVATION_THRESHOLD = 64;
const RESISTANCE = 0.4;
const MIN_REFRESH_DURATION = 600;

type RefreshState = "idle" | "pulling" | "refreshing" | "done";

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [state, setState] = useState<RefreshState>("idle");
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (state === "refreshing") return;
      const container = containerRef.current;
      if (!container || container.scrollTop > 0) return;

      const touch = e.touches[0];
      if (!touch) return;
      startY.current = touch.clientY;
      isDragging.current = true;
    },
    [state],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current || state === "refreshing") return;

      const touch = e.touches[0];
      if (!touch) return;
      const diff = touch.clientY - startY.current;

      if (diff <= 0) {
        setPullDistance(0);
        setState("idle");
        return;
      }

      const actualDistance =
        diff <= ACTIVATION_THRESHOLD
          ? diff
          : ACTIVATION_THRESHOLD + (diff - ACTIVATION_THRESHOLD) * RESISTANCE;

      setPullDistance(actualDistance);
      setState(diff >= ACTIVATION_THRESHOLD ? "pulling" : "idle");
    },
    [state],
  );

  const handleTouchEnd = useCallback(async () => {
    isDragging.current = false;

    if (pullDistance < ACTIVATION_THRESHOLD) {
      setPullDistance(0);
      setState("idle");
      return;
    }

    setState("refreshing");
    setPullDistance(ACTIVATION_THRESHOLD);

    const start = Date.now();
    try {
      await onRefresh();
    } catch {
      // Silently handle errors
    }

    const elapsed = Date.now() - start;
    if (elapsed < MIN_REFRESH_DURATION) {
      await new Promise((r) => setTimeout(r, MIN_REFRESH_DURATION - elapsed));
    }

    setState("done");
    setTimeout(() => {
      setPullDistance(0);
      setState("idle");
    }, 500);
  }, [pullDistance, onRefresh]);

  const spinnerScale =
    state === "refreshing" || state === "done"
      ? 1
      : Math.min(pullDistance / ACTIVATION_THRESHOLD, 1);

  const spinnerOpacity = spinnerScale;

  const statusText =
    state === "refreshing"
      ? "Refreshing..."
      : state === "done"
        ? "Updated"
        : pullDistance >= ACTIVATION_THRESHOLD
          ? "Release to refresh"
          : "Pull to refresh";

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "relative",
        touchAction: state === "idle" ? "auto" : "none",
      }}
    >
      {/* Pull indicator */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
          height: `${pullDistance}px`,
          overflow: "hidden",
          transition: isDragging.current
            ? "none"
            : "height 200ms ease",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          style={{
            transform: `scale(${spinnerScale})`,
            opacity: spinnerOpacity,
            transition: isDragging.current
              ? "none"
              : "transform 200ms ease, opacity 200ms ease",
          }}
        >
          <Loader2
            size={24}
            style={{
              color: "var(--accent-blue)",
              animation:
                state === "refreshing" && !prefersReducedMotion
                  ? "spin 1s linear infinite"
                  : "none",
            }}
          />
        </div>
        <span
          style={{
            fontSize: "12px",
            color: "var(--text-muted)",
            opacity: spinnerOpacity,
            fontWeight: 500,
          }}
        >
          {statusText}
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isDragging.current
            ? "none"
            : "transform 200ms ease",
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
