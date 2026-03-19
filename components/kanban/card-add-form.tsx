"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/lib/store";
import type { ColumnId } from "@/lib/types";

interface CardAddFormProps {
  columnId: ColumnId;
  onClose: () => void;
}

export function CardAddForm({ columnId, onClose }: CardAddFormProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const addCard = useKanbanStore((s) => s.addCard);

  function handleSave() {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    addCard(columnId, title.trim());
    onClose();
  }

  return (
    <div className="border rounded-lg p-3 flex flex-col gap-2 border-ring">
      <Input
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError("");
        }}
        placeholder="Card title..."
        aria-label="Title"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") onClose();
        }}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
