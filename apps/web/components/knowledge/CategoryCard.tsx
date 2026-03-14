"use client";

import { Card } from "@uniflo/ui";
import type { KBCategory } from "@uniflo/mock-data";
import {
  ShieldCheck, Wrench, Snowflake, GraduationCap, ClipboardCheck,
  Settings, Wind, Package, BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Wrench,
  Snowflake,
  GraduationCap,
  ClipboardCheck,
  Settings,
  Wind,
  Package,
};

interface CategoryCardProps {
  category: KBCategory;
  onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  const Icon = iconMap[category.icon] ?? BookOpen;

  return (
    <Card
      className="cursor-pointer transition-all hover:border-[var(--accent-blue)] hover:scale-[1.01] p-5"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: category.color }} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{category.name}</h3>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {category.article_count} article{category.article_count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Card>
  );
}
