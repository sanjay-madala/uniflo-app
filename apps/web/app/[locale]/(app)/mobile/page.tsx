"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  Ticket,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Play,
} from "lucide-react";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { FAB } from "@/components/mobile/FAB";
import {
  mobileKpiCards as kpiCards,
  mobileTodaysSchedule as todaysSchedule,
  mobileActivityFeed as activityFeed,
} from "@uniflo/mock-data";

interface QuickAction {
  label: string;
  icon: typeof ClipboardCheck;
  href: string;
}

export default function MobileDashboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const [scrollIndicator, setScrollIndicator] = useState(0);

  const handleRefresh = useCallback(async () => {
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 800));
  }, []);

  const quickActions: QuickAction[] = [
    { label: "Start Audit", icon: ClipboardCheck, href: `/${locale}/audit/` },
    { label: "New Ticket", icon: Ticket, href: `/${locale}/tickets/` },
    { label: "View Tasks", icon: CheckSquare, href: `/${locale}/tasks/` },
  ];

  const handleKPIScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollLeft = target.scrollLeft;
      const cardWidth = 160 + 12; // card width + gap
      const index = Math.round(scrollLeft / cardWidth);
      setScrollIndicator(Math.min(index, kpiCards.length - 1));
    },
    [],
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Page title */}
        <div>
          <h1
            style={{
              color: "var(--text-primary)",
              fontSize: "20px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Home
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              margin: "4px 0 0 0",
            }}
          >
            Downtown Hotel
          </p>
        </div>

        {/* KPI Cards - horizontal scroll */}
        <div>
          <div
            onScroll={handleKPIScroll}
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              paddingBottom: "8px",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {kpiCards.map((card, idx) => (
              <Link
                key={idx}
                href={`/${locale}${card.href}`}
                style={{
                  flex: "0 0 160px",
                  height: "96px",
                  scrollSnapAlign: "start",
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 400,
                    color: "var(--text-secondary)",
                  }}
                >
                  {card.label}
                </span>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1,
                  }}
                >
                  {card.value}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    color: card.trendPositive
                      ? "var(--accent-green)"
                      : "var(--accent-red)",
                  }}
                >
                  {card.trendDirection === "up" ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {card.trend}
                </span>
              </Link>
            ))}
          </div>

          {/* Scroll indicator dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              paddingTop: "4px",
            }}
          >
            {kpiCards.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === scrollIndicator ? "8px" : "6px",
                  height: idx === scrollIndicator ? "8px" : "6px",
                  borderRadius: "50%",
                  backgroundColor:
                    idx === scrollIndicator
                      ? "var(--accent-blue)"
                      : "var(--text-muted)",
                  transition: "all 200ms ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
            }}
          >
            Quick Actions
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "12px",
            }}
          >
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{
                    height: "72px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    textDecoration: "none",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <Icon size={24} style={{ color: "var(--accent-blue)" }} />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                      textAlign: "center",
                    }}
                  >
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div>
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
            }}
          >
            Today&apos;s Schedule
          </h2>
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {todaysSchedule.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                }}
              >
                No audits scheduled today
              </div>
            ) : (
              todaysSchedule.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    borderBottom:
                      idx < todaysSchedule.length - 1
                        ? "1px solid var(--border-muted)"
                        : "none",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {item.time}
                      </span>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 500,
                          color: "var(--text-primary)",
                        }}
                      >
                        {item.title}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {item.location} — {item.status}
                    </span>
                  </div>
                  <Link
                    href={`/${locale}/audit/${item.id}/conduct/`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      minHeight: "44px",
                      padding: "0 12px",
                      color: "var(--accent-blue)",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 500,
                      borderRadius: "6px",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    Start
                    <Play size={14} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "8px",
            }}
          >
            Recent Activity
          </h2>
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            {activityFeed.map((item, idx) => (
              <Link
                key={item.id}
                href={`/${locale}${item.href}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  minHeight: "56px",
                  textDecoration: "none",
                  borderBottom:
                    idx < activityFeed.length - 1
                      ? "1px solid var(--border-muted)"
                      : "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <div
                  style={{
                    width: "3px",
                    alignSelf: "stretch",
                    borderRadius: "2px",
                    backgroundColor: item.accentColor,
                    flexShrink: 0,
                    minHeight: "32px",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "var(--text-primary)",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.text}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {item.time}
                </span>
              </Link>
            ))}
          </div>

          <Link
            href={`/${locale}/analytics/`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              marginTop: "8px",
              padding: "12px",
              minHeight: "44px",
              color: "var(--accent-blue)",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            View All Activity
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Floating Action Button */}
      <FAB
        onClick={() => {
          window.location.href = `/${locale}/tickets/`;
        }}
        label="Create new item"
      />
    </PullToRefresh>
  );
}
