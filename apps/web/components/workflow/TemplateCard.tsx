"use client";

import { Badge, Button, Card, CardContent, CardFooter, CardHeader } from "@uniflo/ui";
import type { RuleTemplate } from "@uniflo/mock-data";
import {
  ClipboardCheck,
  ClipboardList,
  ClipboardX,
  AlertTriangle,
  AlertCircle,
  CheckSquare,
  FileText,
  Clock,
  RefreshCw,
  Siren,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ClipboardCheck,
  ClipboardList,
  ClipboardX,
  AlertTriangle,
  AlertCircle,
  CheckSquare,
  FileText,
  Clock,
  RefreshCw,
  Siren,
};

const categoryLabels: Record<string, string> = {
  compliance: "Compliance",
  operations: "Operations",
  support: "Support",
  safety: "Safety",
  quality: "Quality",
  efficiency: "Efficiency",
};

const categoryColors: Record<string, string> = {
  compliance: "text-[var(--accent-green)] border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10",
  operations: "text-[var(--accent-yellow)] border-[var(--accent-yellow)]/30 bg-[var(--accent-yellow)]/10",
  support: "text-[var(--accent-blue)] border-[var(--accent-blue)]/30 bg-[var(--accent-blue)]/10",
  safety: "text-[var(--accent-red)] border-[var(--accent-red)]/30 bg-[var(--accent-red)]/10",
  quality: "text-[var(--accent-purple)] border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/10",
  efficiency: "text-[var(--text-secondary)] border-[var(--text-secondary)]/30 bg-[var(--text-secondary)]/10",
};

interface TemplateCardProps {
  template: RuleTemplate;
  onUseTemplate: (template: RuleTemplate) => void;
}

export function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  const Icon = iconMap[template.icon] ?? ClipboardCheck;
  const isPopular = template.popularity > 200;

  return (
    <Card className="flex flex-col hover:border-[var(--border-strong)] hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
          {template.name}
        </h3>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-xs text-[var(--text-secondary)] line-clamp-3">
          {template.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="default" className={categoryColors[template.category]}>
            {categoryLabels[template.category]}
          </Badge>
          {isPopular && (
            <Badge variant="default" className="text-[var(--accent-purple)] border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/10">
              Popular
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button size="sm" onClick={() => onUseTemplate(template)}>
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
}
