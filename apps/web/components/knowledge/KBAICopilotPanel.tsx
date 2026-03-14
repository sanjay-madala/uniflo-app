"use client";

import { Drawer, Badge, Card, CardContent, Button } from "@uniflo/ui";
import { Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface KBAICopilotPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  articleTitle: string;
}

const mockSimilarArticles = [
  { id: "kba_005", title: "Coffee Machine Daily Maintenance Guide", similarity: 78 },
  { id: "kba_016", title: "Dishwasher Machine Operation & Maintenance", similarity: 45 },
];

const mockSuggestedTags = ["maintenance", "equipment", "daily-cleaning", "barista", "operations"];

const mockReadability = {
  score: 72,
  gradeLevel: "8th grade",
  avgSentenceLength: 18,
  suggestion: "Consider breaking the third paragraph into shorter sentences for clarity.",
};

export function KBAICopilotPanel({ open, onOpenChange, articleTitle }: KBAICopilotPanelProps) {
  const { locale } = useParams<{ locale: string }>();

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="AI Writing Assistant"
      description={`For: "${articleTitle}"`}
    >
      <div className="space-y-6">
        {/* Title icon */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--accent-purple)]" />
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            AI Suggestions
          </span>
        </div>

        {/* Similar articles */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Similar Articles
          </p>
          {mockSimilarArticles.map((article) => (
            <Card key={article.id} className="bg-[var(--bg-primary)]">
              <CardContent className="p-3 space-y-2">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">{article.title}</h4>
                <p className="text-xs text-[var(--text-secondary)]">{article.similarity}% similar content detected</p>
                <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)]">
                  <div
                    className="h-1.5 rounded-full bg-[var(--accent-blue)]"
                    style={{ width: `${article.similarity}%` }}
                  />
                </div>
                <Link
                  href={`/${locale}/knowledge/${article.id}/`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-blue)] hover:underline"
                >
                  View Article <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Suggested tags */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Suggested Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {mockSuggestedTags.map((tag) => (
              <Badge key={tag} className="cursor-pointer hover:bg-[var(--accent-blue)]/20">
                {tag}
              </Badge>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="text-xs">
            + Add all
          </Button>
        </div>

        {/* Readability */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Readability
          </p>
          <Card className="bg-[var(--bg-primary)]">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  Score: {mockReadability.score} / 100
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-tertiary)]">
                <div
                  className="h-2 rounded-full bg-[var(--accent-green)]"
                  style={{ width: `${mockReadability.score}%` }}
                />
              </div>
              <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                <p>Grade Level: {mockReadability.gradeLevel}</p>
                <p>Avg sentence length: {mockReadability.avgSentenceLength} words</p>
              </div>
              <p className="text-xs text-[var(--text-muted)] italic">
                {mockReadability.suggestion}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Drawer>
  );
}
