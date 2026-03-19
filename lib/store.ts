import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Card, ColumnId, Priority, Tag, Subtask } from "./types";

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

interface FilterState {
  searchKeyword: string;
  priorityFilter: Priority | null;
  tagFilter: Tag[];
}

interface KanbanState {
  cards: Card[];
  darkMode: boolean;
  filters: FilterState;

  // Card CRUD
  addCard: (columnId: ColumnId, title: string) => void;
  updateCard: (id: string, changes: Partial<Omit<Card, "id">>) => void;
  deleteCard: (id: string) => void;
  moveCard: (cardId: string, targetColumnId: ColumnId, targetIndex: number) => void;

  // Subtasks
  addSubtask: (cardId: string, title: string) => void;
  toggleSubtask: (cardId: string, subtaskId: string) => void;

  // Dark mode
  toggleDarkMode: () => void;

  // Filters
  setSearchKeyword: (keyword: string) => void;
  setPriorityFilter: (priority: Priority | null) => void;
  setTagFilter: (tags: Tag[]) => void;
  clearAllFilters: () => void;

  // Derived
  getFilteredCards: () => Card[];
  getCardsByColumn: (columnId: ColumnId) => Card[];
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      cards: [],
      darkMode: false,
      filters: {
        searchKeyword: "",
        priorityFilter: null,
        tagFilter: [],
      },

      addCard: (columnId, title) => {
        const cards = get().cards;
        const columnCards = cards.filter((c) => c.columnId === columnId);
        const newCard: Card = {
          id: generateId(),
          title,
          description: "",
          priority: "Medium",
          tags: [],
          dueDate: "",
          subtasks: [],
          columnId,
          order: columnCards.length,
        };
        set({ cards: [...cards, newCard] });
      },

      updateCard: (id, changes) => {
        set({
          cards: get().cards.map((c) => (c.id === id ? { ...c, ...changes } : c)),
        });
      },

      deleteCard: (id) => {
        set({ cards: get().cards.filter((c) => c.id !== id) });
      },

      moveCard: (cardId, targetColumnId, targetIndex) => {
        const cards = get().cards;
        const card = cards.find((c) => c.id === cardId);
        if (!card) return;

        const sourceColumnId = card.columnId;

        // Remove from source
        let updatedCards = cards.filter((c) => c.id !== cardId);

        // Re-index source column
        if (sourceColumnId !== targetColumnId) {
          let sourceOrder = 0;
          updatedCards = updatedCards.map((c) => {
            if (c.columnId === sourceColumnId) {
              return { ...c, order: sourceOrder++ };
            }
            return c;
          });
        }

        // Get target column cards and insert at position
        const targetCards = updatedCards
          .filter((c) => c.columnId === targetColumnId)
          .sort((a, b) => a.order - b.order);

        const movedCard: Card = { ...card, columnId: targetColumnId, order: targetIndex };

        // Insert and re-index target column
        targetCards.splice(targetIndex, 0, movedCard);
        const reindexedTarget = targetCards.map((c, i) => ({ ...c, order: i }));

        // Merge back
        const otherCards = updatedCards.filter((c) => c.columnId !== targetColumnId);
        set({ cards: [...otherCards, ...reindexedTarget] });
      },

      addSubtask: (cardId, title) => {
        const newSubtask: Subtask = {
          id: generateId(),
          title,
          checked: false,
        };
        set({
          cards: get().cards.map((c) =>
            c.id === cardId ? { ...c, subtasks: [...c.subtasks, newSubtask] } : c,
          ),
        });
      },

      toggleSubtask: (cardId, subtaskId) => {
        set({
          cards: get().cards.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  subtasks: c.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, checked: !s.checked } : s,
                  ),
                }
              : c,
          ),
        });
      },

      toggleDarkMode: () => {
        set({ darkMode: !get().darkMode });
      },

      setSearchKeyword: (keyword) => {
        set({ filters: { ...get().filters, searchKeyword: keyword } });
      },

      setPriorityFilter: (priority) => {
        set({ filters: { ...get().filters, priorityFilter: priority } });
      },

      setTagFilter: (tags) => {
        set({ filters: { ...get().filters, tagFilter: tags } });
      },

      clearAllFilters: () => {
        set({
          filters: { searchKeyword: "", priorityFilter: null, tagFilter: [] },
        });
      },

      getFilteredCards: () => {
        const { cards, filters } = get();
        return cards.filter((card) => {
          if (
            filters.searchKeyword &&
            !card.title.toLowerCase().includes(filters.searchKeyword.toLowerCase())
          ) {
            return false;
          }
          if (filters.priorityFilter && card.priority !== filters.priorityFilter) {
            return false;
          }
          if (
            filters.tagFilter.length > 0 &&
            !filters.tagFilter.some((tag) => card.tags.includes(tag))
          ) {
            return false;
          }
          return true;
        });
      },

      getCardsByColumn: (columnId) => {
        return get()
          .getFilteredCards()
          .filter((c) => c.columnId === columnId)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: "kanban-storage",
      version: 1,
      partialize: (state) => ({
        cards: state.cards,
        darkMode: state.darkMode,
      }),
    },
  ),
);
