"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CardDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardTitle: string;
  onConfirm: () => void;
}

export function CardDeleteDialog({
  open,
  onOpenChange,
  cardTitle,
  onConfirm,
}: CardDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Card</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This will permanently delete &quot;{cardTitle}&quot; and
            all its subtasks. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
