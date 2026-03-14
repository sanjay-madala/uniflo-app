"use client";

import { Tabs, TabsList, TabsTrigger } from "@uniflo/ui";
import { Pencil, Eye } from "lucide-react";

interface ArticlePreviewToggleProps {
  mode: "edit" | "preview";
  onChange: (mode: "edit" | "preview") => void;
}

export function ArticlePreviewToggle({ mode, onChange }: ArticlePreviewToggleProps) {
  return (
    <Tabs value={mode} onValueChange={(v) => onChange(v as "edit" | "preview")}>
      <TabsList>
        <TabsTrigger value="edit" className="gap-1">
          <Pencil className="h-3.5 w-3.5" /> Edit
        </TabsTrigger>
        <TabsTrigger value="preview" className="gap-1">
          <Eye className="h-3.5 w-3.5" /> Preview
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
