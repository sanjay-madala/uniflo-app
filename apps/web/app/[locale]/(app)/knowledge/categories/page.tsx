"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { kbCategories as initialCategories } from "@uniflo/mock-data";
import type { KBCategory } from "@uniflo/mock-data";
import {
  PageHeader, BreadcrumbBar, Button, ConfirmDialog,
} from "@uniflo/ui";
import { Plus } from "lucide-react";
import { CategoryManagementTable } from "@/components/knowledge/CategoryManagementTable";
import { CategoryFormModal } from "@/components/knowledge/CategoryFormModal";

export default function CategoriesPage() {
  const { locale } = useParams<{ locale: string }>();

  const [categories, setCategories] = useState<KBCategory[]>([...initialCategories]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<KBCategory | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<KBCategory | null>(null);

  function handleEdit(cat: KBCategory) {
    setEditingCategory(cat);
    setModalOpen(true);
  }

  function handleDelete(cat: KBCategory) {
    setDeletingCategory(cat);
    setDeleteConfirmOpen(true);
  }

  function confirmDelete() {
    if (!deletingCategory) return;
    setCategories(prev => prev.filter(c => c.id !== deletingCategory.id && c.parent_id !== deletingCategory.id));
    setDeleteConfirmOpen(false);
    setDeletingCategory(null);
  }

  function handleSave(data: Partial<KBCategory>) {
    if (editingCategory) {
      // Edit existing
      setCategories(prev =>
        prev.map(c => c.id === editingCategory.id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
      );
    } else {
      // Create new
      const newCat: KBCategory = {
        id: `kbcat_${String(categories.length + 1).padStart(3, "0")}`,
        name: data.name ?? "New Category",
        slug: (data.name ?? "new-category").toLowerCase().replace(/\s+/g, "-"),
        description: data.description ?? "",
        icon: data.icon ?? "BookOpen",
        color: data.color ?? "#58A6FF",
        article_count: 0,
        parent_id: data.parent_id ?? null,
        sort_order: data.sort_order ?? categories.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCategories(prev => [...prev, newCat]);
    }
    setEditingCategory(null);
  }

  function handleOpenCreate() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  const childCount = deletingCategory
    ? categories.filter(c => c.parent_id === deletingCategory.id).length
    : 0;

  const deleteDescription = deletingCategory
    ? `Delete "${deletingCategory.name}"? ${deletingCategory.article_count} article${deletingCategory.article_count !== 1 ? "s" : ""} will become uncategorized.${childCount > 0 ? ` This category has ${childCount} sub-categor${childCount !== 1 ? "ies" : "y"} that will also be deleted.` : ""}`
    : "";

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title="Categories"
        subtitle="Organize your knowledge base articles"
        breadcrumb={
          <BreadcrumbBar
            items={[
              { label: "Knowledge Base", href: `/${locale}/knowledge/` },
              { label: "Categories" },
            ]}
          />
        }
        actions={
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="h-4 w-4" /> New Category
          </Button>
        }
        className="px-0 py-0 border-0"
      />

      <CategoryManagementTable
        categories={categories}
        allCategories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="text-xs text-[var(--text-muted)]">
        {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
      </div>

      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
        categories={categories}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={`Delete ${deletingCategory?.name ?? "Category"}?`}
        description={deleteDescription}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      />
    </div>
  );
}
