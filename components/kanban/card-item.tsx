"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Card } from "@/lib/types";

interface CardItemProps {
  card: Card;
  onClick: () => void;
}

export function CardItem({ card, onClick }: CardItemProps) {
  const checkedCount = card.subtasks.filter((s) => s.checked).length;
  const total = card.subtasks.length;
  const progressValue = total > 0 ? (checkedCount / total) * 100 : 0;

  return (
    <article
      data-card={card.id}
      className="border rounded-lg p-3 bg-card cursor-pointer hover:border-ring transition-colors flex flex-col gap-2"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium truncate">{card.title}</h4>
        <Badge variant="outline" className="shrink-0">
          {card.priority}
        </Badge>
      </div>

      {card.description && (
        <p className="text-xs text-muted-foreground truncate">{card.description}</p>
      )}

      {(card.tags.length > 0 || card.dueDate) && (
        <div className="flex items-center gap-2 flex-wrap">
          {card.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[0.6rem]">
              {tag}
            </Badge>
          ))}
          {card.dueDate && (
            <span className="text-xs text-muted-foreground">
              Due: {card.dueDate}
            </span>
          )}
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center gap-2">
          <Progress value={progressValue} className="flex-1" />
          <span className="text-xs text-muted-foreground">
            {checkedCount}/{total}
          </span>
        </div>
      )}
    </article>
  );
}
