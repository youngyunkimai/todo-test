"use client";

import { useState, useMemo } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { useKanbanStore } from "@/lib/store";
import type { Card, Column as ColumnType } from "@/lib/types";
import { CardItem } from "./card-item";
import { CardAddForm } from "./card-add-form";

function matchesFilter(
  card: Card,
  filters: { searchKeyword: string; priorityFilter: string | null; tagFilter: string[] },
): boolean {
  if (
    filters.searchKeyword &&
    !card.title.toLowerCase().includes(filters.searchKeyword.toLowerCase())
  )
    return false;
  if (filters.priorityFilter && card.priority !== filters.priorityFilter) return false;
  if (
    filters.tagFilter.length > 0 &&
    !filters.tagFilter.some((tag) => card.tags.includes(tag as any))
  )
    return false;
  return true;
}

interface ColumnProps {
  column: ColumnType;
  onCardClick: (card: Card) => void;
}

export function Column({ column, onCardClick }: ColumnProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const allCards = useKanbanStore((s) => s.cards);
  const filters = useKanbanStore((s) => s.filters);

  const columnCards = useMemo(() => {
    return allCards
      .filter((card) => card.columnId === column.id)
      .sort((a, b) => a.order - b.order);
  }, [allCards, column.id]);

  const visibleCount = useMemo(() => {
    return columnCards.filter((card) => matchesFilter(card, filters)).length;
  }, [columnCards, filters]);

  return (
    <div
      data-column={column.id}
      className="border rounded-lg overflow-hidden bg-card flex flex-col"
    >
      <div className="px-4 py-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{column.name}</h3>
          <Badge variant="secondary">{visibleCount}</Badge>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          onClick={() => setShowAddForm(true)}
          aria-label="Add card"
        >
          <IconPlus />
        </Button>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex flex-col gap-3 flex-1 min-h-[100px] ${
              snapshot.isDraggingOver ? "bg-accent/50" : ""
            }`}
          >
            {visibleCount === 0 && !showAddForm && (
              <div className="border-2 border-dashed rounded flex items-center justify-center p-6 text-xs text-muted-foreground">
                No matching cards
              </div>
            )}

            {columnCards.map((card, index) => {
              const visible = matchesFilter(card, filters);
              return (
                <Draggable key={card.id} draggableId={card.id} index={index}>
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={dragSnapshot.isDragging ? "opacity-90 rotate-1" : ""}
                      hidden={!visible}
                      style={dragProvided.draggableProps.style}
                    >
                      <CardItem card={card} onClick={() => onCardClick(card)} />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}

            {showAddForm && (
              <CardAddForm
                columnId={column.id}
                onClose={() => setShowAddForm(false)}
              />
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
