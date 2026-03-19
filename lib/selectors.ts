import type { Card, ColumnId } from "./types";

interface StoreState {
  cards: Card[];
  filters: {
    searchKeyword: string;
    priorityFilter: string | null;
    tagFilter: string[];
  };
}

export function getFilteredCards(state: StoreState): Card[] {
  const { cards, filters } = state;
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
      !filters.tagFilter.some((tag) => card.tags.includes(tag as any))
    ) {
      return false;
    }
    return true;
  });
}

export function getFilteredCardsByColumn(state: StoreState, columnId: ColumnId): Card[] {
  return getFilteredCards(state)
    .filter((c) => c.columnId === columnId)
    .sort((a, b) => a.order - b.order);
}
