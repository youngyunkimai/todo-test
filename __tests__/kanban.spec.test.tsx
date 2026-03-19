/**
 * Kanban Board Spec Tests
 * Generated from artifacts/spec.yaml (KANBAN-001 ~ KANBAN-027)
 * These tests are immutable after creation — fix implementation, not tests.
 */
import { render, screen, within, cleanup, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";

// The main page component that renders the full kanban board
// eslint-disable-next-line @typescript-eslint/no-require-imports
let KanbanPage: React.ComponentType;

beforeEach(async () => {
  cleanup();
  localStorage.clear();
  // Dynamic import to get fresh module each test
  vi.resetModules();
  const mod = await import("@/app/page");
  KanbanPage = mod.default;
});

// ─── Helper: find column by name ────────────────────────────────────────────
function getColumn(name: string) {
  const heading = screen.getByRole("heading", { name });
  // Column container is the closest region or section ancestor
  return heading.closest("[data-column]") as HTMLElement;
}

function getCardsInColumn(columnName: string) {
  const column = getColumn(columnName);
  return within(column).queryAllByRole("article");
}

// ─── Helper: open card add form ─────────────────────────────────────────────
async function openAddForm(columnName: string) {
  const column = getColumn(columnName);
  const addButton = within(column).getByRole("button", { name: /추가|add|\+/i });
  await userEvent.click(addButton);
}

// ─── Helper: open card detail dialog ────────────────────────────────────────
async function openCardDetail(cardTitle: string) {
  const card = screen.getByText(cardTitle).closest("[data-card]") as HTMLElement;
  await userEvent.click(card);
}

// ─── Helper: seed cards via UI ──────────────────────────────────────────────
async function addCardViaUI(columnName: string, title: string) {
  await openAddForm(columnName);
  const input = screen.getByRole("textbox", { name: /제목|title/i });
  await userEvent.clear(input);
  await userEvent.type(input, title);
  await userEvent.click(screen.getByRole("button", { name: /저장|save/i }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-001: 카드 생성 - 정상
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-001: 카드 생성 - 정상", () => {
  it("'To Do' 칼럼에서 추가 후 '장보기' 카드가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");

    const column = getColumn("To Do");
    expect(within(column).getByText("장보기")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-002: 카드 생성 - 제목 미입력
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-002: 카드 생성 - 제목 미입력", () => {
  it("빈 제목으로 저장 시 '제목을 입력해주세요' 오류가 표시된다", async () => {
    render(<KanbanPage />);
    await openAddForm("To Do");
    // Leave title empty, click save
    await userEvent.click(screen.getByRole("button", { name: /저장|save/i }));

    expect(screen.getByText("제목을 입력해주세요")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-003: 카드 상세 보기
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-003: 카드 상세 보기", () => {
  it("카드 클릭 시 다이얼로그에 모든 필드가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");

    const dialog = screen.getByRole("dialog");
    // Title field
    expect(within(dialog).getByRole("textbox", { name: /제목|title/i })).toBeInTheDocument();
    // Description field
    expect(within(dialog).getByRole("textbox", { name: /설명|description/i })).toBeInTheDocument();
    // Priority field
    expect(within(dialog).getByText(/우선순위|priority/i)).toBeInTheDocument();
    // Tag field
    expect(within(dialog).getByText(/태그|tag/i)).toBeInTheDocument();
    // Due date field
    expect(within(dialog).getByLabelText(/마감일|due date/i)).toBeInTheDocument();
    // Subtask field
    expect(within(dialog).getByText(/서브태스크|subtask/i)).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-004: 카드 제목 편집
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-004: 카드 제목 편집", () => {
  it("제목을 수정하고 저장하면 보드에 반영된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");

    const dialog = screen.getByRole("dialog");
    const titleInput = within(dialog).getByRole("textbox", { name: /제목|title/i });
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "마트 장보기");
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    expect(screen.getByText("마트 장보기")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-005: 카드 우선순위 변경
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-005: 카드 우선순위 변경", () => {
  it("우선순위를 High로 변경하면 카드에 High 배지가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");

    const dialog = screen.getByRole("dialog");
    // Click priority select/combobox trigger
    const priorityTrigger = within(dialog).getByRole("combobox", { name: /우선순위|priority/i });
    await userEvent.click(priorityTrigger);
    // Select High option
    await userEvent.click(screen.getByRole("option", { name: /high/i }));
    // Save
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Card should show High badge
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-006: 카드 삭제 - 확인
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-006: 카드 삭제 - 확인", () => {
  it("삭제 확인 시 카드가 사라지고 칼럼 카드 수가 감소한다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await addCardViaUI("To Do", "회의");
    await addCardViaUI("To Do", "운동");

    await openCardDetail("장보기");
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /삭제|delete/i }));

    // AlertDialog confirmation
    const alertDialog = screen.getByRole("alertdialog");
    await userEvent.click(within(alertDialog).getByRole("button", { name: /삭제|delete|확인|confirm/i }));

    expect(screen.queryByText("장보기")).not.toBeInTheDocument();
    expect(getCardsInColumn("To Do")).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-007: 카드 삭제 - 취소
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-007: 카드 삭제 - 취소", () => {
  it("삭제 취소 시 카드가 유지된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await addCardViaUI("To Do", "회의");
    await addCardViaUI("To Do", "운동");

    await openCardDetail("장보기");
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /삭제|delete/i }));

    const alertDialog = screen.getByRole("alertdialog");
    await userEvent.click(within(alertDialog).getByRole("button", { name: /취소|cancel/i }));

    // Card detail dialog is still open — card title should be visible in dialog
    expect(screen.getByText("장보기")).toBeInTheDocument();

    // Close the detail dialog to access the board
    const detailDialog = screen.getByRole("dialog");
    await userEvent.click(within(detailDialog).getByRole("button", { name: /취소|cancel/i }));

    expect(getCardsInColumn("To Do")).toHaveLength(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-008: 서브태스크 추가
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-008: 서브태스크 추가", () => {
  it("서브태스크를 추가하면 체크리스트에 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");

    const dialog = screen.getByRole("dialog");
    const subtaskInput = within(dialog).getByRole("textbox", { name: /서브태스크|subtask/i });
    await userEvent.type(subtaskInput, "계란 사기");
    await userEvent.click(within(dialog).getByRole("button", { name: /추가|add subtask/i }));

    expect(within(dialog).getByText("계란 사기")).toBeInTheDocument();
    const checkbox = within(dialog).getByRole("checkbox", { name: /계란 사기/i });
    expect(checkbox).not.toBeChecked();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-009: 서브태스크 체크 - 진행률 표시
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-009: 서브태스크 체크 - 진행률 표시", () => {
  it("서브태스크 체크 시 진행률이 업데이트된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");

    const dialog = screen.getByRole("dialog");
    // Add 2 subtasks
    const subtaskInput = within(dialog).getByRole("textbox", { name: /서브태스크|subtask/i });
    await userEvent.type(subtaskInput, "계란 사기");
    await userEvent.click(within(dialog).getByRole("button", { name: /추가|add subtask/i }));
    await userEvent.type(subtaskInput, "우유 사기");
    await userEvent.click(within(dialog).getByRole("button", { name: /추가|add subtask/i }));

    // Check first subtask
    await userEvent.click(within(dialog).getByRole("checkbox", { name: /계란 사기/i }));

    expect(within(dialog).getByText("1/2")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-010: 서브태스크 추가 - 빈 내용
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-010: 서브태스크 추가 - 빈 내용", () => {
  it("빈 서브태스크 추가 시 오류 메시지가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");

    const dialog = screen.getByRole("dialog");
    // Click add without typing
    await userEvent.click(within(dialog).getByRole("button", { name: /추가|add subtask/i }));

    expect(within(dialog).getByText("내용을 입력해주세요")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-011: 칼럼 간 드래그&드롭
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-011: 칼럼 간 드래그&드롭", () => {
  it("카드를 다른 칼럼으로 이동하면 카드 수가 변경된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "Task A");
    await addCardViaUI("To Do", "Task B");
    await addCardViaUI("To Do", "Task C");

    // Simulate DnD via store (DnD events are not reliable in jsdom)
    const { useKanbanStore } = await import("@/lib/store");
    const cards = useKanbanStore.getState().cards;
    const firstCard = cards.find((c) => c.title === "Task A");
    await act(() => {
      useKanbanStore.getState().moveCard(firstCard!.id, "in-progress", 0);
    });

    // Re-check the UI after store update
    expect(getCardsInColumn("To Do")).toHaveLength(2);
    expect(getCardsInColumn("In Progress")).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-012: 칼럼 내 순서 변경
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-012: 칼럼 내 순서 변경", () => {
  it("같은 칼럼에서 카드 순서를 변경하면 반영된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "A");
    await addCardViaUI("To Do", "B");
    await addCardViaUI("To Do", "C");

    // Simulate reorder via store
    const { useKanbanStore } = await import("@/lib/store");
    const cards = useKanbanStore.getState().cards.filter((c) => c.columnId === "todo");
    const firstCard = cards[0];
    await act(() => {
      useKanbanStore.getState().moveCard(firstCard.id, "todo", 2);
    });

    const columnCards = getCardsInColumn("To Do");
    const titles = columnCards.map((el) => within(el).getByText(/^[ABC]$/).textContent);
    expect(titles).toEqual(["B", "C", "A"]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-013: 제목 검색 - 매칭
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-013: 제목 검색 - 매칭", () => {
  it("검색어에 매칭되는 카드만 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await addCardViaUI("To Do", "회의");

    const searchInput = screen.getByRole("searchbox");
    await userEvent.type(searchInput, "장");

    expect(screen.getByText("장보기")).toBeVisible();
    expect(screen.queryByText("회의")).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-014: 제목 검색 - 검색어 삭제
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-014: 제목 검색 - 검색어 삭제", () => {
  it("검색어를 삭제하면 모든 카드가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await addCardViaUI("To Do", "회의");

    const searchInput = screen.getByRole("searchbox");
    await userEvent.type(searchInput, "장");
    await userEvent.clear(searchInput);

    expect(screen.getByText("장보기")).toBeVisible();
    expect(screen.getByText("회의")).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-015: 우선순위 필터
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-015: 우선순위 필터", () => {
  it("High 필터 선택 시 High 카드만 표시된다", async () => {
    render(<KanbanPage />);
    // Add card with High priority
    await addCardViaUI("To Do", "긴급 작업");
    await openCardDetail("긴급 작업");
    const dialog = screen.getByRole("dialog");
    const priorityTrigger = within(dialog).getByRole("combobox", { name: /우선순위|priority/i });
    await userEvent.click(priorityTrigger);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Add card with Medium priority
    await addCardViaUI("To Do", "일반 작업");

    // Apply priority filter
    const filterTrigger = screen.getByRole("combobox", { name: /우선순위 필터|priority filter/i });
    await userEvent.click(filterTrigger);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));

    expect(screen.getByText("긴급 작업")).toBeVisible();
    expect(screen.queryByText("일반 작업")).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-016: 우선순위 필터 해제
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-016: 우선순위 필터 해제", () => {
  it("필터 해제 시 모든 카드가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "긴급 작업");
    await addCardViaUI("To Do", "일반 작업1");
    await addCardViaUI("To Do", "일반 작업2");

    // Set High priority on first card
    await openCardDetail("긴급 작업");
    const dialog = screen.getByRole("dialog");
    const priorityTrigger = within(dialog).getByRole("combobox", { name: /우선순위|priority/i });
    await userEvent.click(priorityTrigger);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Apply then remove filter
    const filterTrigger = screen.getByRole("combobox", { name: /우선순위 필터|priority filter/i });
    await userEvent.click(filterTrigger);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));

    // Clear filter
    const clearButton = screen.getByRole("button", { name: /clear all|전체 해제/i });
    await userEvent.click(clearButton);

    const allCards = screen.getAllByRole("article");
    expect(allCards).toHaveLength(3);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-017: 태그 필터 - 단일
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-017: 태그 필터 - 단일", () => {
  it("Bug 태그 필터 시 Bug 카드만 표시된다", async () => {
    render(<KanbanPage />);
    // Add cards with tags
    await addCardViaUI("To Do", "버그1");
    await openCardDetail("버그1");
    let dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /bug/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    await addCardViaUI("To Do", "버그2");
    await openCardDetail("버그2");
    dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /bug/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    await addCardViaUI("To Do", "기능");
    await openCardDetail("기능");
    dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /feature/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Apply tag filter — toggle Bug badge in filter bar
    const tagFilterSection = screen.getByTestId("tag-filter");
    await userEvent.click(within(tagFilterSection).getByRole("button", { name: /bug/i }));

    expect(screen.getByText("버그1")).toBeVisible();
    expect(screen.getByText("버그2")).toBeVisible();
    expect(screen.queryByText("기능")).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-018: 태그 필터 - 복수 (OR 조건)
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-018: 태그 필터 - 복수 (OR 조건)", () => {
  it("Bug + Feature 필터 시 해당 태그 카드가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "버그1");
    await openCardDetail("버그1");
    let dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /bug/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    await addCardViaUI("To Do", "버그2");
    await openCardDetail("버그2");
    dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /bug/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // "기능" card: created with default Feature tag, no dialog edit needed
    await addCardViaUI("To Do", "기능");

    // "디자인" card: remove default Feature, add Design
    await addCardViaUI("To Do", "디자인");
    await openCardDetail("디자인");
    dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /feature/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /design/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Apply multi-tag filter — toggle Bug and Feature badges
    const tagFilterSection = screen.getByTestId("tag-filter");
    await userEvent.click(within(tagFilterSection).getByRole("button", { name: /bug/i }));
    await userEvent.click(within(tagFilterSection).getByRole("button", { name: /feature/i }));

    expect(screen.getByText("버그1")).toBeVisible();
    expect(screen.getByText("버그2")).toBeVisible();
    expect(screen.getByText("기능")).toBeVisible();
    expect(screen.queryByText("디자인")).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-019: 다크모드 토글 - 라이트에서 다크
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-019: 다크모드 토글 - 라이트에서 다크", () => {
  it("토글 클릭 시 다크 모드가 적용된다", async () => {
    render(<KanbanPage />);
    const toggle = screen.getByRole("switch", { name: /다크|dark/i });
    await userEvent.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-020: 다크모드 토글 - 다크에서 라이트
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-020: 다크모드 토글 - 다크에서 라이트", () => {
  it("다크 모드에서 토글 클릭 시 라이트 모드로 복귀한다", async () => {
    render(<KanbanPage />);
    const toggle = screen.getByRole("switch", { name: /다크|dark/i });
    // Enable dark mode first
    await userEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // Toggle back
    await userEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-021: localStorage 저장 - 카드 복원
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-021: localStorage 저장 - 카드 복원", () => {
  it("카드 추가 후 새로고침하면 카드가 유지된다", async () => {
    const { unmount } = render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    unmount();

    // Re-render (simulates refresh)
    vi.resetModules();
    const mod = await import("@/app/page");
    render(<mod.default />);

    expect(screen.getByText("장보기")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-022: localStorage 저장 - 다크모드 복원
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-022: localStorage 저장 - 다크모드 복원", () => {
  it("다크모드 설정 후 새로고침하면 다크모드가 유지된다", async () => {
    const { unmount } = render(<KanbanPage />);
    const toggle = screen.getByRole("switch", { name: /다크|dark/i });
    await userEvent.click(toggle);
    unmount();

    vi.resetModules();
    const mod = await import("@/app/page");
    render(<mod.default />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-023: 검색과 필터 동시 적용
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-023: 검색과 필터 동시 적용", () => {
  it("검색 + 우선순위 필터가 AND 조건으로 동작한다", async () => {
    render(<KanbanPage />);
    // Add card: 장보기 (High)
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");
    let dialog = screen.getByRole("dialog");
    const pt1 = within(dialog).getByRole("combobox", { name: /우선순위|priority/i });
    await userEvent.click(pt1);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Add card: 회의 (High)
    await addCardViaUI("To Do", "회의");
    await openCardDetail("회의");
    dialog = screen.getByRole("dialog");
    const pt2 = within(dialog).getByRole("combobox", { name: /우선순위|priority/i });
    await userEvent.click(pt2);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Add card: 장보기2 (Low - default)
    await addCardViaUI("To Do", "장보기2");

    // Search for "장"
    const searchInput = screen.getByRole("searchbox");
    await userEvent.type(searchInput, "장");

    // Filter by High
    const filterTrigger = screen.getByRole("combobox", { name: /우선순위 필터|priority filter/i });
    await userEvent.click(filterTrigger);
    await userEvent.click(screen.getByRole("option", { name: /high/i }));

    // Only "장보기" (High + title contains "장") should be visible
    expect(screen.getByText("장보기")).toBeVisible();
    expect(screen.queryByText("회의")).not.toBeVisible();
    expect(screen.queryByText("장보기2")).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-024: 빈 칼럼으로 카드 이동
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-024: 빈 칼럼으로 카드 이동", () => {
  it("카드를 빈 칼럼으로 이동하면 해당 칼럼에 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("In Progress", "진행 작업");

    // Move via store
    const { useKanbanStore } = await import("@/lib/store");
    const cards = useKanbanStore.getState().cards;
    const card = cards.find((c) => c.title === "진행 작업");
    await act(() => {
      useKanbanStore.getState().moveCard(card!.id, "done", 0);
    });

    expect(getCardsInColumn("In Progress")).toHaveLength(0);
    expect(getCardsInColumn("Done")).toHaveLength(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-025: 서브태스크 체크 해제 - 진행률 감소
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-025: 서브태스크 체크 해제 - 진행률 감소", () => {
  it("체크된 서브태스크를 해제하면 진행률이 감소한다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");
    await openCardDetail("장보기");

    const dialog = screen.getByRole("dialog");
    const subtaskInput = within(dialog).getByRole("textbox", { name: /서브태스크|subtask/i });

    // Add 2 subtasks
    await userEvent.type(subtaskInput, "계란 사기");
    await userEvent.click(within(dialog).getByRole("button", { name: /추가|add subtask/i }));
    await userEvent.type(subtaskInput, "우유 사기");
    await userEvent.click(within(dialog).getByRole("button", { name: /추가|add subtask/i }));

    // Check then uncheck
    await userEvent.click(within(dialog).getByRole("checkbox", { name: /계란 사기/i }));
    expect(within(dialog).getByText("1/2")).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("checkbox", { name: /계란 사기/i }));
    expect(within(dialog).getByText("0/2")).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-026: 태그 필터 해제
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-026: 태그 필터 해제", () => {
  it("태그 필터 해제 시 모든 카드가 표시된다", async () => {
    render(<KanbanPage />);
    await addCardViaUI("To Do", "카드1");
    await addCardViaUI("To Do", "카드2");
    await addCardViaUI("To Do", "카드3");
    await addCardViaUI("To Do", "카드4");

    // Add Bug tag to card1
    await openCardDetail("카드1");
    let dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: /bug/i }));
    await userEvent.click(within(dialog).getByRole("button", { name: /저장|save/i }));

    // Apply Bug filter — toggle Bug badge in filter bar
    const tagFilterSection = screen.getByTestId("tag-filter");
    await userEvent.click(within(tagFilterSection).getByRole("button", { name: /bug/i }));

    // Clear all filters
    const clearButton = screen.getByRole("button", { name: /clear all|전체 해제/i });
    await userEvent.click(clearButton);

    const allCards = screen.getAllByRole("article");
    expect(allCards).toHaveLength(4);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN-027: localStorage 저장 - 카드 이동 위치 복원
// ═══════════════════════════════════════════════════════════════════════════════
describe("KANBAN-027: localStorage 저장 - 카드 이동 위치 복원", () => {
  it("카드 이동 후 새로고침하면 이동한 위치가 유지된다", async () => {
    const { unmount } = render(<KanbanPage />);
    await addCardViaUI("To Do", "장보기");

    // Move to In Progress via store
    const { useKanbanStore } = await import("@/lib/store");
    const cards = useKanbanStore.getState().cards;
    const card = cards.find((c) => c.title === "장보기");
    await act(() => {
      useKanbanStore.getState().moveCard(card!.id, "in-progress", 0);
    });
    unmount();

    // Re-render
    vi.resetModules();
    const mod = await import("@/app/page");
    render(<mod.default />);

    const inProgressColumn = getColumn("In Progress");
    expect(within(inProgressColumn).getByText("장보기")).toBeInTheDocument();
  });
});
