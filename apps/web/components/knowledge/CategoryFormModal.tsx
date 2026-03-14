"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Input, Select, SelectTrigger, SelectContent, SelectItem, SelectValue, FormField } from "@uniflo/ui";
import type { KBCategory } from "@uniflo/mock-data";

const ICON_OPTIONS = [
  "ShieldCheck", "Wrench", "Snowflake", "GraduationCap", "ClipboardCheck",
  "Settings", "Wind", "Package", "BookOpen", "FileText", "Users", "Heart",
];

const COLOR_SWATCHES = [
  "#3FB950", "#58A6FF", "#D2A8FF", "#FFA657",
  "#F778BA", "#79C0FF", "#7EE787", "#56D364",
];

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: KBCategory | null;
  categories: KBCategory[];
  onSave: (data: Partial<KBCategory>) => void;
}

export function CategoryFormModal({ open, onOpenChange, category, categories, onSave }: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState("#58A6FF");
  const [parentId, setParentId] = useState<string>("none");
  const [sortOrder, setSortOrder] = useState("1");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description);
      setIcon(category.icon);
      setColor(category.color);
      setParentId(category.parent_id ?? "none");
      setSortOrder(String(category.sort_order));
    } else {
      setName("");
      setDescription("");
      setIcon("BookOpen");
      setColor("#58A6FF");
      setParentId("none");
      setSortOrder(String(categories.length + 1));
    }
  }, [category, categories, open]);

  const topLevelCategories = categories.filter(c =>
    !c.parent_id && c.id !== category?.id
  );

  function handleSubmit() {
    onSave({
      name,
      description,
      icon,
      color,
      parent_id: parentId === "none" ? null : parentId,
      sort_order: parseInt(sortOrder, 10) || 1,
    });
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={category ? "Edit Category" : "Create Category"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {category ? "Save Category" : "Create Category"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
          />
        </FormField>

        <FormField label="Description">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description"
          />
        </FormField>

        <FormField label="Icon">
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select icon" />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((iconName) => (
                <SelectItem key={iconName} value={iconName}>{iconName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Color">
          <div className="flex items-center gap-2">
            {COLOR_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                onClick={() => setColor(swatch)}
                className={`h-7 w-7 rounded-full transition-all ${
                  color === swatch
                    ? "ring-2 ring-[var(--accent-blue)] ring-offset-2 ring-offset-[var(--bg-secondary)]"
                    : ""
                }`}
                style={{ backgroundColor: swatch }}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Parent Category">
          <Select value={parentId} onValueChange={setParentId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (top-level)</SelectItem>
              {topLevelCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Sort Order">
          <Input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            min={1}
            className="w-20"
          />
        </FormField>
      </div>
    </Modal>
  );
}
