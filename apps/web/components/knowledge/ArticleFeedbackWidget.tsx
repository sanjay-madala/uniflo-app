"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@uniflo/ui";

interface ArticleFeedbackWidgetProps {
  articleId: string;
  helpfulCount: number;
  notHelpfulCount: number;
}

type Vote = "up" | "down" | null;

export function ArticleFeedbackWidget({ articleId, helpfulCount, notHelpfulCount }: ArticleFeedbackWidgetProps) {
  const [vote, setVote] = useState<Vote>(null);
  const [showThanks, setShowThanks] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`kb-feedback-${articleId}`);
    if (stored === "up" || stored === "down") {
      setVote(stored);
    }
  }, [articleId]);

  const total = helpfulCount + notHelpfulCount;
  const helpfulRate = total > 0 ? Math.round((helpfulCount / total) * 100) : 0;

  function handleVote(v: "up" | "down") {
    setVote(v);
    localStorage.setItem(`kb-feedback-${articleId}`, v);
    setShowThanks(true);
    setTimeout(() => setShowThanks(false), 3000);
  }

  return (
    <div className="flex flex-col items-center gap-3 py-6 border-t border-[var(--border-default)]">
      {showThanks ? (
        <p className="text-sm font-medium text-[var(--accent-green)]">Thanks for your feedback!</p>
      ) : (
        <p className="text-sm text-[var(--text-secondary)]">Was this article helpful?</p>
      )}
      <div className="flex items-center gap-3">
        <Button
          variant={vote === "up" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleVote("up")}
          disabled={vote !== null}
          className={vote === "up" ? "text-[var(--accent-green)]" : vote === "down" ? "opacity-40" : ""}
        >
          <ThumbsUp className="h-4 w-4" />
        </Button>
        <Button
          variant={vote === "down" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleVote("down")}
          disabled={vote !== null}
          className={vote === "down" ? "text-[var(--accent-red)]" : vote === "up" ? "opacity-40" : ""}
        >
          <ThumbsDown className="h-4 w-4" />
        </Button>
      </div>
      {!showThanks && helpfulRate > 0 && (
        <p className="text-xs text-[var(--text-muted)]">
          {helpfulRate}% of readers found this helpful
        </p>
      )}
    </div>
  );
}
