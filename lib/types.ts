export type Priority = "High" | "Medium" | "Low";
export type Tag = "Bug" | "Feature" | "Design" | "Docs";
export type ColumnId = "todo" | "in-progress" | "done";

export interface Subtask {
  id: string;
  title: string;
  checked: boolean;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  tags: Tag[];
  dueDate: string;
  subtasks: Subtask[];
  columnId: ColumnId;
  order: number;
}

export interface Column {
  id: ColumnId;
  name: string;
}

export const COLUMNS: Column[] = [
  { id: "todo", name: "To Do" },
  { id: "in-progress", name: "In Progress" },
  { id: "done", name: "Done" },
];

export const TAGS: Tag[] = ["Bug", "Feature", "Design", "Docs"];

export const COLUMN_ID_MAP: Record<string, ColumnId> = {
  "To Do": "todo",
  "In Progress": "in-progress",
  Done: "done",
};
