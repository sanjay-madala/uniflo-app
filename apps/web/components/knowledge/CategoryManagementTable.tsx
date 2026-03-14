"use client";

import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Button, Badge,
} from "@uniflo/ui";
import type { KBCategory } from "@uniflo/mock-data";
import {
  ShieldCheck, Wrench, Snowflake, GraduationCap, ClipboardCheck,
  Settings, Wind, Package, BookOpen, Pencil, Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck, Wrench, Snowflake, GraduationCap, ClipboardCheck,
  Settings, Wind, Package,
};

interface CategoryManagementTableProps {
  categories: KBCategory[];
  allCategories: KBCategory[];
  onEdit: (category: KBCategory) => void;
  onDelete: (category: KBCategory) => void;
}

export function CategoryManagementTable({ categories, allCategories, onEdit, onDelete }: CategoryManagementTableProps) {
  function getParentName(parentId: string | null): string {
    if (!parentId) return "\u2014";
    const parent = allCategories.find(c => c.id === parentId);
    return parent?.name ?? "\u2014";
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead className="w-12">Icon</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Articles</TableHead>
          <TableHead>Parent</TableHead>
          <TableHead className="w-28 text-end">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((cat, idx) => {
          const Icon = iconMap[cat.icon] ?? BookOpen;
          return (
            <TableRow key={cat.id}>
              <TableCell className="text-xs text-[var(--text-muted)] font-mono">{idx + 1}</TableCell>
              <TableCell>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color: cat.color }} />
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-[var(--text-primary)]">{cat.name}</span>
              </TableCell>
              <TableCell>
                <Badge>{cat.article_count}</Badge>
              </TableCell>
              <TableCell className="text-sm text-[var(--text-secondary)]">
                {getParentName(cat.parent_id)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(cat)}>
                    <Trash2 className="h-3.5 w-3.5 text-[var(--accent-red)]" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
