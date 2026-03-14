"use client";

import {
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

interface SwipeActionButton {
  label: string;
  icon?: ReactNode;
  color: string;
  onClick: () => void;
}

interface SwipeActionProps {
  children: ReactNode;
  leftActions?: SwipeActionButton[];
  rightAction?: SwipeActionButton;
  actionWidth?: number;
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const ACTION_BUTTON_WIDTH = 72;

export function SwipeAction({
  children,
  leftActions = [],
  rightAction,
  actionWidth = ACTION_BUTTON_WIDTH,
  className = "",
}: SwipeActionProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [isOpen, setIsOpen] = useState<"left" | "right" | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const leftTotal = leftActions.length * actionWidth;
  const rightTotal = rightAction ? actionWidth : 0;

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      isHorizontalSwipe.current = null;
      setIsDragging(true);
    },
    [],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      if (!touch) return;

      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      // Determine swipe direction on first significant move
      if (isHorizontalSwipe.current === null) {
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
        }
        return;
      }

      if (!isHorizontalSwipe.current) return;

      e.preventDefault();

      let adjustedDx = dx;
      if (isOpen === "left") {
        adjustedDx = dx - leftTotal;
      } else if (isOpen === "right") {
        adjustedDx = dx + rightTotal;
      }

      // Clamp: cannot swipe right more than rightTotal, or left more than leftTotal
      const clampedX = Math.max(
        -leftTotal,
        Math.min(rightTotal, adjustedDx),
      );
      setOffsetX(clampedX);
    },
    [isDragging, isOpen, leftTotal, rightTotal],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    isHorizontalSwipe.current = null;

    if (offsetX < -SWIPE_THRESHOLD && leftActions.length > 0) {
      setOffsetX(-leftTotal);
      setIsOpen("left");
    } else if (offsetX > SWIPE_THRESHOLD && rightAction) {
      setOffsetX(rightTotal);
      setIsOpen("right");
    } else {
      setOffsetX(0);
      setIsOpen(null);
    }
  }, [offsetX, leftActions.length, leftTotal, rightAction, rightTotal]);

  const handleActionClick = useCallback(
    (action: SwipeActionButton) => {
      action.onClick();
      setOffsetX(0);
      setIsOpen(null);
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        touchAction: "pan-y",
      }}
    >
      {/* Left-side action buttons (revealed when swiping left) */}
      {leftActions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            zIndex: 0,
          }}
          aria-hidden={isOpen !== "left"}
        >
          {leftActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleActionClick(action)}
              style={{
                width: `${actionWidth}px`,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                border: "none",
                cursor: "pointer",
                color: "white",
                fontSize: "11px",
                fontWeight: 600,
                backgroundColor: action.color,
                minHeight: "44px",
                WebkitTapHighlightColor: "transparent",
              }}
              aria-label={action.label}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* Right-side action button (revealed when swiping right) */}
      {rightAction && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            display: "flex",
            zIndex: 0,
          }}
          aria-hidden={isOpen !== "right"}
        >
          <button
            onClick={() => handleActionClick(rightAction)}
            style={{
              width: `${actionWidth}px`,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: rightAction.color,
              minHeight: "44px",
              WebkitTapHighlightColor: "transparent",
            }}
            aria-label={rightAction.label}
          >
            {rightAction.icon}
            {rightAction.label}
          </button>
        </div>
      )}

      {/* Main content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "var(--bg-secondary)",
          transform: `translateX(${offsetX}px)`,
          transition: isDragging
            ? "none"
            : "transform 200ms ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
