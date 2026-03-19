import { describe, it, expect, beforeEach } from "vitest";
import { useKanbanStore } from "@/lib/store";

beforeEach(() => {
  localStorage.clear();
  useKanbanStore.setState({
    cards: [],
    darkMode: false,
    filters: { searchKeyword: "", priorityFilter: null, tagFilter: [] },
  });
});

describe("Card CRUD", () => {
  it("addCard adds a card to the specified column", () => {
    useKanbanStore.getState().addCard("todo", "장보기");
    const cards = useKanbanStore.getState().cards;
    expect(cards).toHaveLength(1);
    expect(cards[0].title).toBe("장보기");
    expect(cards[0].columnId).toBe("todo");
    expect(cards[0].priority).toBe("Medium");
  });

  it("deleteCard removes a card", () => {
    useKanbanStore.getState().addCard("todo", "장보기");
    const id = useKanbanStore.getState().cards[0].id;
    useKanbanStore.getState().deleteCard(id);
    expect(useKanbanStore.getState().cards).toHaveLength(0);
  });

  it("updateCard updates card fields", () => {
    useKanbanStore.getState().addCard("todo", "장보기");
    const id = useKanbanStore.getState().cards[0].id;
    useKanbanStore.getState().updateCard(id, { title: "마트 장보기", priority: "High" });
    const card = useKanbanStore.getState().cards[0];
    expect(card.title).toBe("마트 장보기");
    expect(card.priority).toBe("High");
  });

  it("moveCard moves a card to another column", () => {
    useKanbanStore.getState().addCard("todo", "Task A");
    useKanbanStore.getState().addCard("todo", "Task B");
    const cardA = useKanbanStore.getState().cards[0];
    useKanbanStore.getState().moveCard(cardA.id, "in-progress", 0);

    const todoCards = useKanbanStore.getState().cards.filter((c) => c.columnId === "todo");
    const inProgressCards = useKanbanStore
      .getState()
      .cards.filter((c) => c.columnId === "in-progress");
    expect(todoCards).toHaveLength(1);
    expect(inProgressCards).toHaveLength(1);
    expect(inProgressCards[0].title).toBe("Task A");
  });

  it("moveCard reorders within the same column", () => {
    useKanbanStore.getState().addCard("todo", "A");
    useKanbanStore.getState().addCard("todo", "B");
    useKanbanStore.getState().addCard("todo", "C");

    const cardA = useKanbanStore.getState().cards.find((c) => c.title === "A")!;
    useKanbanStore.getState().moveCard(cardA.id, "todo", 2);

    const todoCards = useKanbanStore
      .getState()
      .cards.filter((c) => c.columnId === "todo")
      .sort((a, b) => a.order - b.order);
    expect(todoCards.map((c) => c.title)).toEqual(["B", "C", "A"]);
  });
});

describe("Subtasks", () => {
  it("addSubtask adds a subtask with checked: false", () => {
    useKanbanStore.getState().addCard("todo", "장보기");
    const cardId = useKanbanStore.getState().cards[0].id;
    useKanbanStore.getState().addSubtask(cardId, "계란 사기");

    const card = useKanbanStore.getState().cards[0];
    expect(card.subtasks).toHaveLength(1);
    expect(card.subtasks[0].title).toBe("계란 사기");
    expect(card.subtasks[0].checked).toBe(false);
  });

  it("toggleSubtask toggles checked state", () => {
    useKanbanStore.getState().addCard("todo", "장보기");
    const cardId = useKanbanStore.getState().cards[0].id;
    useKanbanStore.getState().addSubtask(cardId, "계란 사기");
    const subtaskId = useKanbanStore.getState().cards[0].subtasks[0].id;

    useKanbanStore.getState().toggleSubtask(cardId, subtaskId);
    expect(useKanbanStore.getState().cards[0].subtasks[0].checked).toBe(true);

    useKanbanStore.getState().toggleSubtask(cardId, subtaskId);
    expect(useKanbanStore.getState().cards[0].subtasks[0].checked).toBe(false);
  });
});

describe("Filters", () => {
  beforeEach(() => {
    useKanbanStore.getState().addCard("todo", "장보기");
    useKanbanStore.getState().addCard("todo", "회의");
    const cards = useKanbanStore.getState().cards;
    useKanbanStore.getState().updateCard(cards[0].id, { priority: "High", tags: ["Bug"] });
    useKanbanStore.getState().updateCard(cards[1].id, { priority: "Medium", tags: ["Feature"] });
  });

  it("search filters by title", () => {
    useKanbanStore.getState().setSearchKeyword("장");
    const filtered = useKanbanStore.getState().getFilteredCards();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("장보기");
  });

  it("priority filter works", () => {
    useKanbanStore.getState().setPriorityFilter("High");
    const filtered = useKanbanStore.getState().getFilteredCards();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].priority).toBe("High");
  });

  it("tag filter works (OR)", () => {
    useKanbanStore.getState().setTagFilter(["Bug", "Feature"]);
    const filtered = useKanbanStore.getState().getFilteredCards();
    expect(filtered).toHaveLength(2);
  });

  it("combined filters work as AND", () => {
    useKanbanStore.getState().setSearchKeyword("장");
    useKanbanStore.getState().setPriorityFilter("High");
    const filtered = useKanbanStore.getState().getFilteredCards();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe("장보기");
  });

  it("clearAllFilters resets all filters", () => {
    useKanbanStore.getState().setSearchKeyword("장");
    useKanbanStore.getState().setPriorityFilter("High");
    useKanbanStore.getState().setTagFilter(["Bug"]);
    useKanbanStore.getState().clearAllFilters();
    const filtered = useKanbanStore.getState().getFilteredCards();
    expect(filtered).toHaveLength(2);
  });
});

describe("Dark mode", () => {
  it("toggleDarkMode toggles the state", () => {
    expect(useKanbanStore.getState().darkMode).toBe(false);
    useKanbanStore.getState().toggleDarkMode();
    expect(useKanbanStore.getState().darkMode).toBe(true);
    useKanbanStore.getState().toggleDarkMode();
    expect(useKanbanStore.getState().darkMode).toBe(false);
  });
});

describe("localStorage persistence", () => {
  it("persists cards and darkMode", () => {
    useKanbanStore.getState().addCard("todo", "장보기");
    useKanbanStore.getState().toggleDarkMode();

    const stored = JSON.parse(localStorage.getItem("kanban-storage") || "{}");
    expect(stored.state.cards).toHaveLength(1);
    expect(stored.state.darkMode).toBe(true);
  });
});
