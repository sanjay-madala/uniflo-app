"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileDown, Star, BarChart3 } from "lucide-react";
import { useCSATDashboardData } from "@/lib/data/useCSATData";
import type {
  CSATDashboardSummary,
  CSATTrendPoint,
  CSATDistribution,
  CSATCategoryScore,
  CSATLowScoreEntry,
  CSATAlert,
} from "@uniflo/mock-data";
import { PageHeader } from "@uniflo/ui";
import { CSATScoreCard } from "@/components/csat/CSATScoreCard";
import { CSATTrendChart } from "@/components/csat/CSATTrendChart";
import { CSATDistributionBar } from "@/components/csat/CSATDistributionBar";
import { CSATAlertBanner } from "@/components/csat/CSATAlertBanner";
import { LowScoreTable } from "@/components/csat/LowScoreTable";

const categoryColorMap: Record<number, string> = {
  5: "var(--accent-green)",
  4: "var(--accent-green)",
  3: "var(--accent-yellow)",
  2: "var(--accent-orange)",
  1: "var(--accent-red)",
};

function getScoreColor(score: number): string {
  if (score >= 4.0) return "var(--accent-green)";
  if (score >= 3.0) return "var(--accent-yellow)";
  return "var(--accent-red)";
}

export default function CSATDashboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const [dateRange, setDateRange] = useState<string>("30d");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  const {
    summary,
    trend,
    distribution,
    categoryScores,
    lowScores,
    alerts,
  } = useCSATDashboardData();

  const activeAlert = useMemo(
    () => alerts.find((a) => a.status === "active") ?? null,
    [alerts]
  );

  const sortedCategories = useMemo(
    () => [...categoryScores].sort((a, b) => a.avg_score - b.avg_score),
    [categoryScores]
  );

  const avgScoreTrend = useMemo(() => {
    if (summary.avg_score_previous === 0) return 0;
    return Math.round(
      ((summary.avg_score - summary.avg_score_previous) /
        summary.avg_score_previous) *
        100
    );
  }, [summary]);

  const responseRateTrend = useMemo(() => {
    if (summary.response_rate_previous === 0) return 0;
    return Math.round(
      ((summary.response_rate - summary.response_rate_previous) /
        summary.response_rate_previous) *
        100
    );
  }, [summary]);

  const responseTrend = useMemo(() => {
    if (summary.total_responses_previous === 0) return 0;
    return Math.round(
      ((summary.total_responses - summary.total_responses_previous) /
        summary.total_responses_previous) *
        100
    );
  }, [summary]);

  const lowScoreTrend = useMemo(() => {
    if (summary.low_score_count_previous === 0) return 0;
    return Math.round(
      ((summary.low_score_count - summary.low_score_count_previous) /
        summary.low_score_count_previous) *
        100
    );
  }, [summary]);

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="CSAT Dashboard"
        subtitle="Customer satisfaction analytics"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="h-9 rounded-sm border px-3 text-sm"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="h-9 rounded-sm border px-3 text-sm"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <option value="all">All Locations</option>
              <option value="loc_001">Downtown</option>
              <option value="loc_002">Airport</option>
              <option value="loc_003">Resort</option>
            </select>
            <button
              className="flex h-9 items-center gap-2 rounded-sm border px-3 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
              }}
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* Alert Banner */}
      {activeAlert && !alertDismissed && (
        <CSATAlertBanner
          alert={activeAlert}
          onViewDetails={() =>
            router.push(
              `/${locale}/tickets/${activeAlert.contributing_ticket_ids[0]}/csat-alert`
            )
          }
          onDismiss={() => setAlertDismissed(true)}
        />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CSATScoreCard
          title="Avg CSAT Score"
          value={summary.avg_score.toFixed(1)}
          unit="/ 5"
          trend={avgScoreTrend}
          isPositive={true}
          accent="var(--accent-blue)"
        />
        <CSATScoreCard
          title="Response Rate"
          value={`${summary.response_rate}%`}
          trend={responseRateTrend}
          isPositive={true}
        />
        <CSATScoreCard
          title="Total Responses"
          value={summary.total_responses.toLocaleString()}
          trend={responseTrend}
          isPositive={true}
        />
        <CSATScoreCard
          title="Low Score Alerts"
          value={summary.low_score_count}
          trend={lowScoreTrend}
          isPositive={false}
          accent={
            summary.low_score_count > 0
              ? "var(--accent-red)"
              : "var(--text-primary)"
          }
          onClick={() => {
            const el = document.getElementById("low-score-table");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>

      {/* Trend Chart */}
      <CSATTrendChart data={trend} height={280} />

      {/* Row 2: Distribution + Category */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CSATDistributionBar
          distribution={distribution}
          onSegmentClick={(star) =>
            setStarFilter(starFilter === star ? null : star)
          }
          activeFilter={starFilter}
        />

        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-default)",
          }}
        >
          <h3
            className="mb-4 text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            By Category
          </h3>
          <div className="space-y-3">
            {sortedCategories.map((cat) => {
              const maxScore = 5;
              const pct = (cat.avg_score / maxScore) * 100;
              const color = getScoreColor(cat.avg_score);

              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span
                    className="w-28 shrink-0 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {cat.category_label}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-5 overflow-hidden rounded"
                      style={{
                        backgroundColor: "var(--bg-tertiary, rgba(0,0,0,0.1))",
                      }}
                    >
                      <div
                        className="h-full rounded transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className="w-8 shrink-0 text-right text-sm font-semibold"
                    style={{ color }}
                  >
                    {cat.avg_score.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Low Score Table */}
      <div id="low-score-table">
        <LowScoreTable
          entries={lowScores}
          locale={locale}
          filterByStar={starFilter}
        />
      </div>
    </div>
  );
}
