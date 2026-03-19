"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { IconTrash } from "@tabler/icons-react";
import { useKanbanStore } from "@/lib/store";
import { TAGS, type Card, type Priority, type Tag } from "@/lib/types";
import { SubtaskList } from "./subtask-list";
import { CardDeleteDialog } from "./card-delete-dialog";

interface CardDetailDialogProps {
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailDialog({ card, open, onOpenChange }: CardDetailDialogProps) {
  const updateCard = useKanbanStore((s) => s.updateCard);
  const deleteCard = useKanbanStore((s) => s.deleteCard);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [tags, setTags] = useState<Tag[]>([]);
  const [dueDate, setDueDate] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const cardId = card?.id ?? "";
  const freshCard = useKanbanStore((s) => s.cards.find((c) => c.id === cardId));
  const subtasks = freshCard?.subtasks ?? card?.subtasks ?? [];

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setPriority(card.priority);
      setTags([...card.tags]);
      setDueDate(card.dueDate);
    }
  }, [card]);

  if (!card) return null;

  function handleSave() {
    if (!card) return;
    updateCard(card.id, { title, description, priority, tags, dueDate });
    onOpenChange(false);
  }

  function handleDelete() {
    if (!card) return;
    deleteCard(card.id);
    setDeleteOpen(false);
    onOpenChange(false);
  }

  function toggleTag(tag: Tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Card Detail</DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="card-title">Title</FieldLabel>
              <Input
                id="card-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="card-description">Description</FieldLabel>
              <Textarea
                id="card-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="card-priority">Priority</FieldLabel>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger id="card-priority" aria-label="Priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="card-due-date">Due Date</FieldLabel>
                <Input
                  id="card-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Tags</FieldLabel>
              <div className="flex gap-2 flex-wrap">
                {TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    role="button"
                    aria-label={tag}
                    aria-pressed={tags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </Field>

            <SubtaskList cardId={card.id} subtasks={subtasks} />
          </FieldGroup>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setDeleteOpen(true)}>
              <IconTrash data-icon="inline-start" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        cardTitle={card.title}
        onConfirm={handleDelete}
      />
    </>
  );
}
