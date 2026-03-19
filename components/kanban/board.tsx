"use client";

import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useKanbanStore } from "@/lib/store";
import { COLUMNS, type Card } from "@/lib/types";
import { Column } from "./column";
import { SearchFilterBar } from "./search-filter-bar";
import { DarkModeToggle } from "./dark-mode-toggle";
import { CardDetailDialog } from "./card-detail-dialog";

export function KanbanBoard() {
  const moveCard = useKanbanStore((s) => s.moveCard);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function handleDragEnd(result: DropResult) {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    moveCard(draggableId, destination.droppableId as any, destination.index);
  }

  function handleCardClick(card: Card) {
    setSelectedCard(card);
    setDetailOpen(true);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold">Kanban Board</h1>
        <DarkModeToggle />
      </div>

      <SearchFilterBar />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => (
            <Column key={col.id} column={col} onCardClick={handleCardClick} />
          ))}
        </div>
      </DragDropContext>

      <CardDetailDialog
        card={selectedCard}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
