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
  compliance: "text-[#3FB950] border-[#3FB950]/30 bg-[#3FB950]/10",
  operations: "text-[#D29922] border-[#D29922]/30 bg-[#D29922]/10",
  support: "text-[#58A6FF] border-[#58A6FF]/30 bg-[#58A6FF]/10",
  safety: "text-[#F85149] border-[#F85149]/30 bg-[#F85149]/10",
  quality: "text-[#BC8CFF] border-[#BC8CFF]/30 bg-[#BC8CFF]/10",
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
    <Card className="flex flex-col hover:border-[#3D444D] hover:shadow-md transition-all">
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
            <Badge variant="default" className="text-[#BC8CFF] border-[#BC8CFF]/30 bg-[#BC8CFF]/10">
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
