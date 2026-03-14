"use client";

import { KPICard } from "@uniflo/ui";
import type { ArticleAnalytics } from "@uniflo/mock-data";

interface ArticleAnalyticsCardsProps {
  analytics: ArticleAnalytics[];
  currentPeriod: string;
  previousPeriod: string;
}

function sumField(data: ArticleAnalytics[], field: keyof ArticleAnalytics, period: string): number {
  return data
    .filter(a => a.period === period)
    .reduce((sum, a) => {
      const val = a[field];
      return sum + (typeof val === "number" ? val : 0);
    }, 0);
}

function avgField(data: ArticleAnalytics[], field: keyof ArticleAnalytics, period: string): number {
  const filtered = data.filter(a => a.period === period);
  if (filtered.length === 0) return 0;
  const total = filtered.reduce((sum, a) => {
    const val = a[field];
    return sum + (typeof val === "number" ? val : 0);
  }, 0);
  return Math.round(total / filtered.length);
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatReadTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function ArticleAnalyticsCards({ analytics, currentPeriod, previousPeriod }: ArticleAnalyticsCardsProps) {
  const currentViews = sumField(analytics, "views", currentPeriod);
  const prevViews = sumField(analytics, "views", previousPeriod);

  const currentUnique = sumField(analytics, "unique_views", currentPeriod);
  const prevUnique = sumField(analytics, "unique_views", previousPeriod);

  const currentHelpful = sumField(analytics, "helpful_votes", currentPeriod);
  const currentNotHelpful = sumField(analytics, "not_helpful_votes", currentPeriod);
  const prevHelpful = sumField(analytics, "helpful_votes", previousPeriod);
  const prevNotHelpful = sumField(analytics, "not_helpful_votes", previousPeriod);

  const helpfulRate = currentHelpful + currentNotHelpful > 0
    ? Math.round((currentHelpful / (currentHelpful + currentNotHelpful)) * 100)
    : 0;
  const prevHelpfulRate = prevHelpful + prevNotHelpful > 0
    ? Math.round((prevHelpful / (prevHelpful + prevNotHelpful)) * 100)
    : 0;

  const currentReadTime = avgField(analytics, "avg_read_time_seconds", currentPeriod);
  const prevReadTime = avgField(analytics, "avg_read_time_seconds", previousPeriod);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Views"
        value={currentViews.toLocaleString()}
        trend={calcTrend(currentViews, prevViews)}
        trendLabel="vs prev period"
      />
      <KPICard
        title="Unique Readers"
        value={currentUnique.toLocaleString()}
        trend={calcTrend(currentUnique, prevUnique)}
        trendLabel="vs prev period"
      />
      <KPICard
        title="Helpful Rate"
        value={`${helpfulRate}%`}
        trend={calcTrend(helpfulRate, prevHelpfulRate)}
        trendLabel="vs prev period"
      />
      <KPICard
        title="Avg Read Time"
        value={formatReadTime(currentReadTime)}
        trend={calcTrend(currentReadTime, prevReadTime)}
        trendLabel="vs prev period"
        isPositive={false}
      />
    </div>
  );
}
