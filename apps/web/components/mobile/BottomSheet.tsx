"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoints?: number[];
  footer?: ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  snapPoints = [0.7],
  footer,
}: BottomSheetProps) {
  const [translateY, setTranslateY] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentTranslate = useRef(0);
  const sheetHeight = useRef(0);

  const maxSnap = Math.max(...snapPoints);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        setTranslateY(0);
      });
      document.body.style.overflow = "hidden";
    } else {
      setTranslateY(100);
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleClose = useCallback(() => {
    setTranslateY(100);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    dragStartY.current = touch.clientY;
    currentTranslate.current = 0;
    setIsDragging(true);
    if (sheetRef.current) {
      sheetHeight.current = sheetRef.current.offsetHeight;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    const diff = touch.clientY - dragStartY.current;
    if (diff > 0) {
      currentTranslate.current = diff;
      const pct = (diff / sheetHeight.current) * 100;
      setTranslateY(Math.min(pct, 100));
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const threshold = sheetHeight.current * 0.5;
    if (currentTranslate.current > threshold) {
      handleClose();
    } else {
      setTranslateY(0);
    }
    currentTranslate.current = 0;
  }, [handleClose]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const transitionDuration = prefersReducedMotion ? "0ms" : "300ms";

  if (!open && translateY === 100) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
      }}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: translateY >= 100 ? 0 : 1 - translateY / 100,
          transition: isDragging
            ? "none"
            : `opacity ${transitionDuration} ease`,
        }}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: `${maxSnap * 100}vh`,
          minHeight: "200px",
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "16px 16px 0 0",
          display: "flex",
          flexDirection: "column",
          transform: `translateY(${translateY}%)`,
          transition: isDragging
            ? "none"
            : `transform ${transitionDuration} cubic-bezier(0.32, 0.72, 0, 1)`,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Drag handle */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 0",
            cursor: "grab",
            touchAction: "none",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "var(--border-default)",
            }}
          />
        </div>

        {/* Header */}
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "4px 20px 12px",
              borderBottom: "1px solid var(--border-muted)",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--text-primary)",
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={handleClose}
              style={{
                width: "44px",
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                borderRadius: "8px",
                WebkitTapHighlightColor: "transparent",
              }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: "12px 20px",
              borderTop: "1px solid var(--border-muted)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
