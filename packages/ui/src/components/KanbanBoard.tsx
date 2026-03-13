"use client";

import * as React from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical } from "lucide-react";
import { cn } from "../lib/utils";

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  assignee?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color?: string;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string) => void;
  onAddCard?: (columnId: string) => void;
  className?: string;
}

function KanbanCardItem({ card, isDragging }: { card: KanbanCard; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-md border border-[var(--border-default)] bg-[var(--bg-secondary)] p-3 shadow-sm hover:border-[var(--border-strong)] transition-colors",
        isDragging ? "opacity-50" : ""
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 shrink-0 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing transition-opacity"
          aria-label="Drag card"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">{card.title}</p>
          {card.description && (
            <p className="mt-1 text-xs text-[var(--text-muted)] line-clamp-2">{card.description}</p>
          )}
          {card.labels && card.labels.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {card.labels.map((label) => (
                <span key={label} className="inline-flex rounded-full bg-[var(--accent-blue)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--accent-blue)]">
                  {label}
                </span>
              ))}
            </div>
          )}
          {card.assignee && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">@{card.assignee}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ columns, onCardMove, onAddCard, className }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = React.useState<KanbanCard | null>(null);
  const [boardColumns, setBoardColumns] = React.useState(columns);

  React.useEffect(() => { setBoardColumns(columns); }, [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const findColumnByCardId = (cardId: string) =>
    boardColumns.find((col) => col.cards.some((c) => c.id === cardId));

  const handleDragStart = (event: DragStartEvent) => {
    const col = findColumnByCardId(String(event.active.id));
    const card = col?.cards.find((c) => c.id === String(event.active.id));
    setActiveCard(card ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over || active.id === over.id) return;

    const fromCol = findColumnByCardId(String(active.id));
    const toCol =
      boardColumns.find((c) => c.id === String(over.id)) ??
      findColumnByCardId(String(over.id));

    if (!fromCol || !toCol) return;

    setBoardColumns((prev) => {
      const next = prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== String(active.id)),
      }));
      const card = fromCol.cards.find((c) => c.id === String(active.id))!;
      return next.map((col) =>
        col.id === toCol.id ? { ...col, cards: [...col.cards, card] } : col
      );
    });

    onCardMove?.(String(active.id), fromCol.id, toCol.id);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {boardColumns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-72 flex flex-col gap-2">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                {col.color && (
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                )}
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{col.title}</h3>
                <span className="rounded-full bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                  {col.cards.length}
                </span>
              </div>
              {onAddCard && (
                <button
                  onClick={() => onAddCard(col.id)}
                  className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={`Add card to ${col.title}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="rounded-lg bg-[var(--bg-tertiary)]/50 p-2 min-h-[100px] flex flex-col gap-2">
              <SortableContext items={col.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {col.cards.map((card) => (
                  <KanbanCardItem key={card.id} card={card} isDragging={activeCard?.id === card.id} />
                ))}
              </SortableContext>
              {col.cards.length === 0 && (
                <div className="flex-1 flex items-center justify-center rounded-md border-2 border-dashed border-[var(--border-muted)] py-6">
                  <span className="text-xs text-[var(--text-muted)]">Drop here</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeCard && (
          <div className="rounded-md border border-[var(--accent-blue)] bg-[var(--bg-secondary)] p-3 shadow-xl opacity-90">
            <p className="text-sm font-medium text-[var(--text-primary)]">{activeCard.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
