"use client";

import {
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code2, Minus, Link2, ImageIcon, Table2,
  Undo, Redo,
} from "lucide-react";

interface ArticleEditorToolbarProps {
  disabled?: boolean;
  onImageClick?: () => void;
}

export function ArticleEditorToolbar({ disabled = false, onImageClick }: ArticleEditorToolbarProps) {
  const buttonClass =
    "p-2 rounded hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]";
  const disabledClass = disabled ? " opacity-50 cursor-not-allowed" : "";
  const divider = <div className="w-px h-6 bg-[var(--border-default)]" />;

  return (
    <div
      className={`border-b border-[var(--border-default)] bg-[var(--bg-primary)] p-2 flex gap-0.5 flex-wrap items-center overflow-x-auto${
        disabled ? " opacity-50" : ""
      }`}
    >
      {/* Group 1: Bold, Italic, Underline */}
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Bold (Ctrl+B)">
        <Bold size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Italic (Ctrl+I)">
        <Italic size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Underline">
        <UnderlineIcon size={16} />
      </button>

      {divider}

      {/* Group 2: Headings */}
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Heading 1">
        <Heading1 size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Heading 2">
        <Heading2 size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Heading 3">
        <Heading3 size={16} />
      </button>

      {divider}

      {/* Group 3: Lists, Blockquote */}
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Bullet List">
        <List size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Ordered List">
        <ListOrdered size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Blockquote">
        <Quote size={16} />
      </button>

      {divider}

      {/* Group 4: Code, Rule */}
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Code Block">
        <Code2 size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Horizontal Rule">
        <Minus size={16} />
      </button>

      {divider}

      {/* Group 5: Link, Image, Table */}
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Insert Link">
        <Link2 size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Insert Image" onClick={onImageClick}>
        <ImageIcon size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Insert Table">
        <Table2 size={16} />
      </button>

      {divider}

      {/* Group 6: Undo, Redo */}
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Undo">
        <Undo size={16} />
      </button>
      <button type="button" disabled={disabled} className={buttonClass + disabledClass} title="Redo">
        <Redo size={16} />
      </button>
    </div>
  );
}
