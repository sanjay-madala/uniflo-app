"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { Plus } from "lucide-react";

interface FABProps {
  onClick: () => void;
  icon?: ReactNode;
  label: string;
}

export function FAB({
  onClick,
  icon = <Plus size={24} />,
  label,
}: FABProps) {
  const [visible, setVisible] = useState(true);
  const [pressed, setPressed] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const handleScroll = () => {
      const currentScrollY = main.scrollTop;
      if (currentScrollY > lastScrollY.current && currentScrollY > 56) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <button
      onClick={onClick}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        right: "16px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "var(--accent-blue)",
        color: "white",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 35,
        transform: `scale(${pressed ? 0.92 : 1}) translateY(${visible ? 0 : 120}px)`,
        opacity: visible ? 1 : 0,
        transition: prefersReducedMotion
          ? "none"
          : "transform 200ms ease, opacity 200ms ease",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
