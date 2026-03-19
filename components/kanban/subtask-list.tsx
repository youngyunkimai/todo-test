"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { IconPlus } from "@tabler/icons-react";
import { useKanbanStore } from "@/lib/store";
import type { Subtask } from "@/lib/types";

interface SubtaskListProps {
  cardId: string;
  subtasks: Subtask[];
}

export function SubtaskList({ cardId, subtasks }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");
  const addSubtask = useKanbanStore((s) => s.addSubtask);
  const toggleSubtask = useKanbanStore((s) => s.toggleSubtask);

  const checkedCount = subtasks.filter((s) => s.checked).length;
  const total = subtasks.length;
  const progressValue = total > 0 ? (checkedCount / total) * 100 : 0;

  function handleAdd() {
    if (!newTitle.trim()) {
      setError("내용을 입력해주세요");
      return;
    }
    setError("");
    addSubtask(cardId, newTitle.trim());
    setNewTitle("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Subtasks</Label>
        {total > 0 && (
          <span className="text-xs text-muted-foreground">
            {checkedCount}/{total}
          </span>
        )}
      </div>

      {total > 0 && <Progress value={progressValue} />}

      <div className="flex flex-col gap-1">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2">
            <Checkbox
              id={`subtask-${subtask.id}`}
              checked={subtask.checked}
              onCheckedChange={() => toggleSubtask(cardId, subtask.id)}
              aria-label={subtask.title}
            />
            <label
              htmlFor={`subtask-${subtask.id}`}
              className={cn(
                "text-sm",
                subtask.checked && "line-through text-muted-foreground",
              )}
            >
              {subtask.title}
            </label>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={newTitle}
          onChange={(e) => {
            setNewTitle(e.target.value);
            if (error) setError("");
          }}
          placeholder="Add subtask..."
          aria-label="Subtask"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button variant="outline" size="icon" onClick={handleAdd} aria-label="Add subtask">
          <IconPlus data-icon="inline-start" />
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
