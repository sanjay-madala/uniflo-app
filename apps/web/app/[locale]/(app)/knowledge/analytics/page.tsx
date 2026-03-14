"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  kbArticles, kbAnalytics, kbSearchGaps,
} from "@uniflo/mock-data";
import type { KBArticle, ArticleAnalytics } from "@uniflo/mock-data";
import {
  PageHeader, BreadcrumbBar, Button,
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
  Tabs, TabsList, TabsTrigger, TabsContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  DonutChart, Badge,
} from "@uniflo/ui";
import { Download, ArrowUpDown, Eye, ThumbsUp, Clock } from "lucide-react";
import { ArticleAnalyticsCards } from "@/components/knowledge/ArticleAnalyticsCards";
import { SearchGapsTable } from "@/components/knowledge/SearchGapsTable";

const DATE_RANGES: Record<string, { label: string; current: string; previous: string }> = {
  "30": { label: "Last 30 days", current: "2026-03", previous: "2026-02" },
  "90": { label: "Last 90 days", current: "2026-03", previous: "2025-12" },
  "7": { label: "Last 7 days", current: "2026-03", previous: "2026-02" },
  "365": { label: "Last 12 months", current: "2026-03", previous: "2025-10" },
};

type SortKey = "views" | "helpful" | "readTime";
type SortDir = "asc" | "desc";

function formatReadTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

export default function AnalyticsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [dateRange, setDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState("top_articles");
  const [sortKey, setSortKey] = useState<SortKey>("views");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const articles = kbArticles as KBArticle[];
  const analytics = kbAnalytics as ArticleAnalytics[];
  const range = DATE_RANGES[dateRange];

  // Top articles computed from analytics for current period
  const topArticles = useMemo(() => {
    const periodData = analytics.filter(a => a.period === range.current);
    const articleMap = new Map<string, ArticleAnalytics>();
    for (const d of periodData) {
      articleMap.set(d.article_id, d);
    }

    const results = articles
      .filter(a => articleMap.has(a.id))
      .map(a => {
        const data = articleMap.get(a.id)!;
        const helpful = data.helpful_votes + data.not_helpful_votes > 0
          ? Math.round((data.helpful_votes / (data.helpful_votes + data.not_helpful_votes)) * 100)
          : 0;
        return {
          article: a,
          views: data.views,
          helpful,
          readTime: data.avg_read_time_seconds,
        };
      });

    results.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "views") cmp = a.views - b.views;
      else if (sortKey === "helpful") cmp = a.helpful - b.helpful;
      else cmp = a.readTime - b.readTime;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return results;
  }, [articles, analytics, range, sortKey, sortDir]);

  // Referral source aggregation
  const referralData = useMemo(() => {
    const periodData = analytics.filter(a => a.period === range.current);
    const totals: Record<string, number> = {};
    for (const d of periodData) {
      for (const ref of d.referral_source) {
        totals[ref.source] = (totals[ref.source] ?? 0) + ref.count;
      }
    }
    const sourceLabels: Record<string, string> = {
      search: "Search",
      direct: "Direct Link",
      ticket_sidebar: "Ticket Sidebar",
      sop_link: "SOP Link",
      external: "External",
    };
    const sourceColors: Record<string, string> = {
      search: "var(--accent-blue)",
      direct: "var(--accent-green)",
      ticket_sidebar: "var(--accent-yellow)",
      sop_link: "var(--accent-purple)",
      external: "var(--accent-pink)",
    };
    return Object.entries(totals).map(([source, value]) => ({
      name: sourceLabels[source] ?? source,
      value,
      color: sourceColors[source] ?? "var(--accent-blue)",
    }));
  }, [analytics, range]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleExport() {
    // Mock export
    window.alert("CSV exported successfully");
  }

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
      onClick={() => toggleSort(field)}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Knowledge Base Analytics"
        subtitle="Understand what your team reads and what's missing"
        breadcrumb={
          <BreadcrumbBar
            items={[
              { label: "Knowledge Base", href: `/${locale}/knowledge/` },
              { label: "Analytics" },
            ]}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
        className="px-0 py-0 border-0"
      />

      {/* KPI Cards */}
      <ArticleAnalyticsCards
        analytics={analytics}
        currentPeriod={range.current}
        previousPeriod={range.previous}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="top_articles">Top Articles</TabsTrigger>
          <TabsTrigger value="search_gaps">Search Gaps</TabsTrigger>
          <TabsTrigger value="referral_sources">Referral Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="top_articles">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Article Title</TableHead>
                <TableHead><SortButton label="Views" field="views" /></TableHead>
                <TableHead><SortButton label="Helpful" field="helpful" /></TableHead>
                <TableHead><SortButton label="Read Time" field="readTime" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topArticles.map((item, idx) => (
                <TableRow key={item.article.id} className="cursor-pointer">
                  <TableCell className="text-xs text-[var(--text-muted)] font-mono">{idx + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/${locale}/knowledge/${item.article.id}/`}
                      className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-blue)] transition-colors"
                    >
                      {item.article.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                      <Eye className="h-3 w-3" /> {item.views}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                      <ThumbsUp className="h-3 w-3" /> {item.helpful}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                      <Clock className="h-3 w-3" /> {formatReadTime(item.readTime)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="search_gaps">
          <SearchGapsTable gaps={kbSearchGaps} />
        </TabsContent>

        <TabsContent value="referral_sources">
          <div className="flex flex-col md:flex-row items-center gap-8 p-4">
            <div className="w-full max-w-sm">
              <DonutChart
                data={referralData}
                height={280}
                showLegend
                showTooltip
                innerRadius={60}
                outerRadius={100}
              />
            </div>
            <div className="space-y-3 flex-1">
              {referralData.map((item) => {
                const total = referralData.reduce((s, d) => s + d.value, 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-[var(--text-primary)]">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-secondary)]">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
