import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  Heading1,
  Heading2,
  Heading3,
  Code2,
  MoreVertical,
} from "lucide-react";
import clsx from "clsx";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  disabled = false,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const buttonClass = (isActive: boolean) =>
    clsx(
      "p-2 rounded hover:bg-gray-700 transition-colors",
      isActive && "bg-gray-700 text-blue-400",
      disabled && "opacity-50 cursor-not-allowed"
    );

  return (
    <div
      className={clsx(
        "rounded-lg border border-gray-700 bg-gray-800 overflow-hidden",
        className
      )}
    >
      {/* Toolbar */}
      <div
        className={clsx(
          "border-b border-gray-700 bg-gray-900 p-2 flex gap-1 flex-wrap",
          disabled && "opacity-50"
        )}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={buttonClass(editor.isActive("bold"))}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={buttonClass(editor.isActive("italic"))}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon size={18} />
        </button>

        <div className="w-px bg-gray-700" />

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          disabled={disabled}
          className={buttonClass(editor.isActive("heading", { level: 1 }))}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={disabled}
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          disabled={disabled}
          className={buttonClass(editor.isActive("heading", { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </button>

        <div className="w-px bg-gray-700" />

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={buttonClass(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <ListIcon size={18} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={buttonClass(editor.isActive("orderedList"))}
          title="Ordered List"
        >
          <ListIcon size={18} style={{ transform: "scaleX(-1)" }} />
        </button>

        <div className="w-px bg-gray-700" />

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          disabled={disabled}
          className={buttonClass(editor.isActive("codeBlock"))}
          title="Code Block"
        >
          <Code2 size={18} />
        </button>
      </div>

      {/* Editor */}
      <div
        className={clsx(
          "p-4 min-h-[200px] text-gray-100",
          "prose prose-invert max-w-none",
          "[&_h1]:text-2xl [&_h1]:font-bold",
          "[&_h2]:text-xl [&_h2]:font-bold",
          "[&_h3]:text-lg [&_h3]:font-bold",
          "[&_p]:text-sm [&_p]:leading-relaxed",
          "[&_ul]:list-disc [&_ul]:ml-4",
          "[&_ol]:list-decimal [&_ol]:ml-4",
          "[&_li]:text-sm",
          "[&_pre]:bg-gray-900 [&_pre]:rounded [&_pre]:p-3 [&_pre]:overflow-x-auto",
          "[&_code]:bg-gray-900 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs"
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
