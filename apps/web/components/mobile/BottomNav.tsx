"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  ClipboardCheck,
  Ticket,
  MoreHorizontal,
} from "lucide-react";
import { BottomSheet } from "./BottomSheet";
import type { LucideIcon } from "lucide-react";

interface NavTab {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: number;
}

function getNavTabs(locale: string): NavTab[] {
  return [
    { icon: LayoutDashboard, label: "Home", href: `/${locale}/dashboard/` },
    { icon: CheckSquare, label: "Tasks", href: `/${locale}/tasks/` },
    { icon: ClipboardCheck, label: "Audits", href: `/${locale}/audit/` },
    { icon: Ticket, label: "Tickets", href: `/${locale}/tickets/` },
  ];
}

interface MoreMenuItem {
  label: string;
  href: string;
  group: "operations" | "account";
}

function getMoreMenuItems(locale: string): MoreMenuItem[] {
  return [
    { label: "SOPs", href: `/${locale}/sops/`, group: "operations" },
    { label: "CAPA", href: `/${locale}/capa/`, group: "operations" },
    { label: "Analytics", href: `/${locale}/analytics/`, group: "operations" },
    { label: "Automation", href: `/${locale}/workflow/`, group: "operations" },
    { label: "Knowledge Base", href: `/${locale}/knowledge/`, group: "operations" },
    { label: "SLA", href: `/${locale}/sla/`, group: "operations" },
    { label: "Profile", href: `/${locale}/profile/`, group: "account" },
    { label: "Settings", href: `/${locale}/admin/settings/`, group: "account" },
  ];
}

export function BottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  const tabs = getNavTabs(locale);
  const moreItems = getMoreMenuItems(locale);

  const operations = moreItems.filter((i) => i.group === "operations");
  const account = moreItems.filter((i) => i.group === "account");

  const isTabActive = useCallback(
    (href: string) => {
      const normalizedPath = pathname.replace(/\/$/, "");
      const normalizedHref = href.replace(/\/$/, "");
      return normalizedPath.startsWith(normalizedHref);
    },
    [pathname],
  );

  const isMoreActive = moreItems.some((item) => isTabActive(item.href));

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    scrollContainerRef.current = main;

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

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main mobile navigation"
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: "var(--bg-secondary)",
          borderTop: "1px solid var(--border-default)",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 200ms ease",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "56px",
            alignItems: "center",
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                  height: "56px",
                  textDecoration: "none",
                  position: "relative",
                  color: active
                    ? "var(--accent-blue)"
                    : "var(--text-muted)",
                  transition: "color 150ms ease",
                  WebkitTapHighlightColor: "transparent",
                }}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      width: "24px",
                      height: "3px",
                      borderRadius: "0 0 3px 3px",
                      backgroundColor: "var(--accent-blue)",
                      transition: "width 200ms ease-out",
                    }}
                  />
                )}
                <span style={{ position: "relative" }}>
                  <Icon size={24} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-8px",
                        minWidth: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: "var(--accent-red)",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 4px",
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 500,
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}

          {/* More tab */}
          <button
            onClick={() => setMoreOpen(true)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              height: "56px",
              background: "none",
              border: "none",
              cursor: "pointer",
              position: "relative",
              color: isMoreActive || moreOpen
                ? "var(--accent-blue)"
                : "var(--text-muted)",
              transition: "color 150ms ease",
              WebkitTapHighlightColor: "transparent",
              padding: 0,
            }}
            aria-label="More navigation options"
            aria-expanded={moreOpen}
          >
            {(isMoreActive || moreOpen) && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  width: "24px",
                  height: "3px",
                  borderRadius: "0 0 3px 3px",
                  backgroundColor: "var(--accent-blue)",
                }}
              />
            )}
            <MoreHorizontal size={24} />
            <span style={{ fontSize: "10px", fontWeight: 500, lineHeight: 1 }}>
              More
            </span>
          </button>
        </div>
      </nav>

      <BottomSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="More"
      >
        <div style={{ padding: "8px 0" }}>
          <div
            style={{
              padding: "8px 20px 4px",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Operations
          </div>
          {operations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                minHeight: "44px",
                textDecoration: "none",
                color: isTabActive(item.href)
                  ? "var(--accent-blue)"
                  : "var(--text-primary)",
                fontSize: "15px",
                fontWeight: isTabActive(item.href) ? 500 : 400,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}

          <div
            style={{
              height: "1px",
              backgroundColor: "var(--border-muted)",
              margin: "8px 20px",
            }}
          />

          <div
            style={{
              padding: "8px 20px 4px",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Account
          </div>
          {account.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMoreOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 20px",
                minHeight: "44px",
                textDecoration: "none",
                color: isTabActive(item.href)
                  ? "var(--accent-blue)"
                  : "var(--text-primary)",
                fontSize: "15px",
                fontWeight: isTabActive(item.href) ? 500 : 400,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}

          <div
            style={{
              padding: "16px 20px",
              fontSize: "12px",
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            Uniflo v1.0.0
          </div>
        </div>
      </BottomSheet>
    </>
  );
}
