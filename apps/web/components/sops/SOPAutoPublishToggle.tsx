"use client";

import { Switch, Badge, Button, Card, CardHeader, CardTitle, CardContent } from "@uniflo/ui";
import { ExternalLink } from "lucide-react";

interface SOPAutoPublishToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  sopTitle: string;
  linkedArticleId: string | null;
  locale: string;
}

export function SOPAutoPublishToggle({
  enabled,
  onToggle,
  sopTitle,
  linkedArticleId,
  locale,
}: SOPAutoPublishToggleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Publish to Knowledge Base</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      {enabled ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-[var(--text-secondary)]">KB Article Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium text-[var(--text-primary)]">{sopTitle}</p>
            <div className="flex items-center gap-2">
              <Badge>Internal</Badge>
              <Badge variant="blue">Auto-generated</Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Auto-updated on SOP publish. Steps are converted to article sections.
            </p>
            {linkedArticleId && (
              <Button variant="ghost" size="sm" className="text-xs mt-1" asChild>
                <a href={`/${locale}/knowledge/${linkedArticleId}/`}>
                  <ExternalLink className="h-3 w-3" /> Open KB Article
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-xs text-[var(--text-secondary)] rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] p-3">
          Enable to auto-publish this SOP as a Knowledge Base article. The article will update each time the SOP is published.
        </p>
      )}
    </div>
  );
}
