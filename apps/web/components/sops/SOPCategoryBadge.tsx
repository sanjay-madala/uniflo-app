"use client";

import { Badge } from "@uniflo/ui";
import type { SOPCategory } from "@uniflo/mock-data";
import { ShieldCheck, Settings, Headphones, Scale, Wrench, Users, type LucideIcon } from "lucide-react";

const sopCategoryConfig: Record<SOPCategory, { label: string; icon: LucideIcon }> = {
  safety:           { label: "Safety",           icon: ShieldCheck },
  operations:       { label: "Operations",       icon: Settings },
  customer_service: { label: "Customer Service", icon: Headphones },
  compliance:       { label: "Compliance",       icon: Scale },
  maintenance:      { label: "Maintenance",      icon: Wrench },
  hr:               { label: "HR",               icon: Users },
};

export function SOPCategoryBadge({ category }: { category: SOPCategory }) {
  const config = sopCategoryConfig[category];
  const Icon = config.icon;
  return (
    <Badge>
      <Icon className="h-3 w-3" aria-label={config.label} />
      {config.label}
    </Badge>
  );
}
