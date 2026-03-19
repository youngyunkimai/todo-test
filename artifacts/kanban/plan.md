# Kanban Board 구현 계획

## Architecture Decisions

| 결정 사항 | 선택 | 사유 |
|-----------|------|------|
| 상태 관리 | Zustand | localStorage 미들웨어 내장, 보일러플레이트 최소, 선택적 리렌더링 |
| 드래그&드롭 | @hello-pangea/dnd | 칸반 보드에 최적화된 API, 접근성 우수, react-beautiful-dnd 후계 |
| 진행률 바 | shadcn Progress | 디자인 시스템 일관성 유지 |
| 다크모드 | Tailwind dark class + Zustand persist | html 요소에 dark 클래스 토글, localStorage로 영속화 |

## Required Skills

| 스킬 | 용도 |
|------|------|
| vercel-react-best-practices | React/Next.js 성능 최적화 규칙 |
| web-design-guidelines | Web Interface Guidelines 준수 |
| shadcn | 컴포넌트 사용 규칙 및 패턴 |

## UI Components

### 설치 필요

| 컴포넌트 | 설치 명령 |
|----------|-----------|
| progress | `bunx --bun shadcn@latest add progress` |

### 외부 라이브러리 설치

| 패키지 | 설치 명령 |
|--------|-----------|
| zustand | `bun add zustand` |
| @hello-pangea/dnd | `bun add @hello-pangea/dnd` |

### 기존 shadcn 컴포넌트 매핑

| 화면 요소 | shadcn 컴포넌트 |
|-----------|----------------|
| 카드 | Card |
| 카드 상세 모달 | Dialog |
| 삭제 확인 | AlertDialog |
| 우선순위/태그 배지 | Badge |
| 버튼 | Button |
| 텍스트 입력 | Input |
| 설명 입력 | Textarea |
| 우선순위 선택 | Select |
| 서브태스크 체크 | Checkbox |
| 다크모드 토글 | Switch |
| 검색 입력 | InputGroup |
| 태그 복수 선택 (카드 상세) | 인라인 Badge 토글 (Button 그룹) |
| 태그 필터 (검색바) | Combobox |
| 폼 구조 | Field, Label |
| 진행률 | Progress (신규) |

## 실행 프로토콜

- 각 task 시작 전, **참조 규칙**에 나열된 파일을 반드시 읽고 규칙을 준수하며 구현한다
- tsx/jsx 파일 작성 시 `.claude/skills/shadcn/rules/` 디렉토리의 규칙 파일을 읽고 준수한다
- `components/ui/*` 소스 파일을 직접 수정하지 않는다

## Tasks

### Task 0: 의존성 설치

- **시나리오**: 전체 (선행 작업)
- **참조 규칙**: `.claude/skills/shadcn/SKILL.md` (CLI 사용법)
- **구현 대상**:
  - zustand, @hello-pangea/dnd 패키지 설치
  - shadcn progress 컴포넌트 추가
  - 설치 확인 (import 가능 여부)
- **수용 기준**:
  - [ ] `bun add zustand @hello-pangea/dnd` 성공
  - [ ] `bunx --bun shadcn@latest add progress` 성공
  - [ ] `bun run build` 에러 없음
- **커밋**: `chore: add zustand, hello-pangea/dnd, and progress component`

---

### Task 1: Spec 테스트 생성

- **시나리오**: KANBAN-001 ~ KANBAN-027 전체
- **참조 규칙**: `artifacts/spec.yaml`, `artifacts/kanban/wireframe.html`, `CLAUDE.md` (spec 테스트 작성 규칙)
- **구현 대상**:
  - `__tests__/kanban.spec.test.tsx` — 27개 시나리오를 수용 기준 테스트로 변환
  - 요소 선택은 `getByRole`, `getByLabelText`, `getByText` 등 안정적 패턴 사용
  - wireframe의 컴포넌트 타입에 맞는 인터랙션 패턴 (Select, Switch, Checkbox, Dialog 등)
- **수용 기준**:
  - [ ] `bun run test` 실행 시 27개 테스트가 모두 인식됨 (Red — 전부 실패 OK)
  - [ ] 각 테스트가 spec.yaml의 given/when/then과 examples를 반영
  - [ ] 내부 상태가 아닌 화면 단언만 사용
- **커밋**: `test: add kanban spec tests from spec.yaml (red)`

---

### Task 2: 데이터 모델 + Zustand 스토어

- **시나리오**: KANBAN-021, 022, 027 (localStorage 영속화)
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/client-localstorage-schema.md` (localStorage 스키마 버전 관리)
  - `.claude/skills/vercel-react-best-practices/rules/js-cache-storage.md` (storage 읽기 캐시)
- **구현 대상**:
  - `lib/types.ts` — Card, Column, Subtask, Priority, Tag 타입 정의
  - `lib/store.ts` — Zustand 스토어 (persist 미들웨어로 localStorage 자동 동기화)
  - `__tests__/store.test.tsx` — 스토어 단위 테스트
- **수용 기준**:
  - [ ] Card 타입: id, title, description, priority, tags, dueDate, subtasks, columnId, order
  - [ ] `addCard({ column: "To Do", title: "장보기" })` → 스토어에 카드 추가
  - [ ] `deleteCard(id)` → 스토어에서 카드 제거
  - [ ] `updateCard(id, changes)` → 카드 필드 업데이트
  - [ ] `moveCard(cardId, targetColumn, targetIndex)` → 카드 이동
  - [ ] `addSubtask(cardId, "계란 사기")` → 해당 카드의 subtasks 배열 길이 +1, 새 항목 checked: false
  - [ ] `toggleSubtask(cardId, subtaskId)` → 해당 서브태스크 checked 토글
  - [ ] localStorage persist: 스토어 변경 → localStorage 저장 → 새 스토어 인스턴스에서 복원
  - [ ] `bun run test -- store.test` 전체 통과
- **커밋**: `feat: add kanban data model and zustand store with localStorage persistence`

---

### Task 3: 칸반 보드 레이아웃

- **시나리오**: (기본 화면 — 시나리오 없음)
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/styling.md` (시맨틱 색상, gap, cn())
  - `.claude/skills/shadcn/rules/composition.md` (Card 구성)
  - `.claude/skills/shadcn/rules/icons.md` (data-icon 패턴)
  - `web-design-guidelines` (접근성)
- **구현 대상**:
  - `app/page.tsx` — 메인 페이지 (보드 컴포넌트 렌더)
  - `components/kanban/board.tsx` — 3칼럼 그리드 레이아웃
  - `components/kanban/column.tsx` — 칼럼 컴포넌트 (헤더 + 카드 리스트 + 추가 버튼)
  - `components/kanban/card-item.tsx` — 카드 아이템 (제목, 우선순위 Badge, 태그 Badge, 마감일, 서브태스크 Progress)
- **수용 기준**:
  - [ ] 3칼럼 (To Do / In Progress / Done) 그리드 렌더링
  - [ ] 각 칼럼에 헤더(이름 + 카드 수 Badge + 추가 버튼) 표시
  - [ ] 카드에 제목, 우선순위 Badge, 태그 Badge, 마감일, 서브태스크 진행률 표시
  - [ ] 서브태스크 0개인 카드 → Progress bar 미표시
  - [ ] 카드 0개인 칼럼 → 빈 칼럼 placeholder 표시 ("No matching cards" 등)
  - [ ] 반응형: 데스크톱 3칼럼 → 모바일 단일 칼럼 스택
  - [ ] `bun run build` 에러 없음
- **커밋**: `feat: add kanban board layout with columns and cards`

---

### Task 4: 카드 생성

- **시나리오**: KANBAN-001, 002
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/forms.md` (Field, 유효성 검사)
  - `.claude/skills/shadcn/rules/styling.md`
- **구현 대상**:
  - `components/kanban/card-add-form.tsx` — 칼럼 하단 인라인 추가 폼 (Input + Save/Cancel Button)
  - `__tests__/card-create.test.tsx` — 생성 로직 단위 테스트
- **수용 기준**:
  - [ ] 칼럼의 '+' 버튼 클릭 → 인라인 폼 표시
  - [ ] 제목 "장보기" 입력 후 Save → "To Do" 칼럼에 "장보기" 카드 표시
  - [ ] 빈 제목으로 Save → "제목을 입력해주세요" 오류 메시지 표시
  - [ ] Cancel → 폼 닫힘, 카드 추가 없음
  - [ ] `bun run test -- card-create` 통과
- **커밋**: `feat: add card creation with inline form and validation`

---

### Task 5: 카드 상세 다이얼로그 + 편집

- **시나리오**: KANBAN-003, 004, 005
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/composition.md` (Dialog Title 필수, Field 구성)
  - `.claude/skills/shadcn/rules/forms.md` (FieldGroup + Field)
  - `.claude/skills/shadcn/rules/icons.md`
- **구현 대상**:
  - `components/kanban/card-detail-dialog.tsx` — Dialog 컴포넌트 (제목 Input, 설명 Textarea, 우선순위 Select, 태그 인라인 Badge 토글 그룹, 마감일 date Input, 서브태스크 섹션). 태그는 Dialog 본문 내 predefined 4개(Bug, Feature, Design, Docs)를 Badge Button으로 렌더링하고 클릭 시 선택/해제 토글
  - `__tests__/card-detail.test.tsx` — 상세/편집 단위 테스트
- **수용 기준**:
  - [ ] 카드 클릭 → Dialog에 제목, 설명, 우선순위, 태그, 마감일, 서브태스크 필드 표시
  - [ ] 제목 "장보기" → "마트 장보기" 수정 후 저장 → 보드에 "마트 장보기" 표시
  - [ ] 우선순위 "High" 선택 후 저장 → 카드에 "High" Badge 표시
  - [ ] 태그: 사전 정의 4개(Bug, Feature, Design, Docs) 토글 선택
  - [ ] `bun run test -- card-detail` 통과
- **커밋**: `feat: add card detail dialog with edit functionality`

---

### Task 6: 카드 삭제

- **시나리오**: KANBAN-006, 007
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/composition.md` (AlertDialog 구성)
- **구현 대상**:
  - `components/kanban/card-delete-dialog.tsx` — AlertDialog (확인/취소)
  - `__tests__/card-delete.test.tsx` — 삭제 단위 테스트
- **수용 기준**:
  - [ ] 상세 Dialog에서 Delete 클릭 → AlertDialog "Are you sure?" 표시
  - [ ] 확인 → 카드 삭제, 칼럼 카드 수 1 감소
  - [ ] 취소 → 카드 유지, 칼럼 카드 수 변화 없음
  - [ ] `bun run test -- card-delete` 통과
- **커밋**: `feat: add card deletion with confirmation dialog`

---

### Task 7: 서브태스크 관리

- **시나리오**: KANBAN-008, 009, 010, 025
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/forms.md` (Field 유효성 검사)
  - `.claude/skills/shadcn/rules/composition.md` (Checkbox, Progress)
- **구현 대상**:
  - `components/kanban/subtask-list.tsx` — 서브태스크 체크리스트 (Checkbox + Progress + 추가 Input)
  - `__tests__/subtask.test.tsx` — 서브태스크 단위 테스트
- **수용 기준**:
  - [ ] "계란 사기" 입력 후 추가 → 체크리스트에 "계란 사기" 미체크 항목 표시
  - [ ] 빈 내용 추가 시도 → "내용을 입력해주세요" 오류 메시지
  - [ ] 2개 중 1개 체크 → Progress에 "1/2" 표시
  - [ ] 체크된 항목 다시 클릭 → 해제, "0/2" 표시
  - [ ] `bun run test -- subtask` 통과
- **커밋**: `feat: add subtask management with checklist and progress`

---

### Task 8: 드래그&드롭

- **시나리오**: KANBAN-011, 012, 024
- **참조 규칙**:
  - `.claude/skills/vercel-react-best-practices/rules/rerender-memo.md` (드래그 중 불필요 리렌더 방지)
  - `.claude/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md` (안정적 콜백)
  - `web-design-guidelines` (접근성: 키보드 DnD)
- **구현 대상**:
  - `components/kanban/board.tsx` 수정 — DragDropContext, Droppable 래핑
  - `components/kanban/column.tsx` 수정 — Droppable 칼럼
  - `components/kanban/card-item.tsx` 수정 — Draggable 카드
  - `__tests__/drag-drop.test.tsx` — 드래그&드롭 단위 테스트
- **수용 기준**:
  - [ ] "To Do" 카드를 "In Progress"로 드래그 → "To Do" 카드 수 감소, "In Progress" 카드 수 증가
  - [ ] 같은 칼럼 내 카드 A를 C 아래로 드래그 → B, C, A 순서
  - [ ] 카드 0개인 칼럼으로 드래그 → 해당 칼럼에 카드 표시
  - [ ] `bun run test -- drag-drop` 통과
- **커밋**: `feat: add drag and drop for cards between and within columns`

---

### Task 9: 검색 & 필터

- **시나리오**: KANBAN-013, 014, 015, 016, 017, 018, 023, 026
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/forms.md` (InputGroup, Select, Combobox)
  - `.claude/skills/vercel-react-best-practices/rules/rerender-derived-state.md` (파생 상태 최적화)
  - `.claude/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md`
- **구현 대상**:
  - `components/kanban/search-filter-bar.tsx` — 검색 InputGroup + 우선순위 Select + 태그 Combobox + Active filter 칩 영역
  - `lib/store.ts` 수정 — 검색/필터 상태 추가, 파생 상태로 필터링된 카드 계산
  - `__tests__/search-filter.test.tsx` — 검색/필터 단위 테스트
- **수용 기준**:
  - [ ] 검색 "장" → "장보기" 카드만 표시, "회의" 숨김
  - [ ] 검색어 삭제 → 모든 카드 표시
  - [ ] 우선순위 "High" 선택 → High 카드만 표시
  - [ ] 우선순위 필터 해제 → 모든 카드 표시
  - [ ] 태그 "Bug" 선택 → Bug 카드만 표시
  - [ ] 태그 "Bug" + "Feature" 선택 → Bug OR Feature 카드 표시
  - [ ] 태그 필터 해제 → 모든 카드 표시
  - [ ] 검색 "장" + 우선순위 "High" → AND 조건으로 1개만 표시
  - [ ] 필터 적용 시 Active filter 칩 표시 (예: "Priority: High ✕"), 칩 ✕ 클릭 시 해당 필터 해제
  - [ ] "Clear all" 클릭 시 전체 필터 초기화
  - [ ] 필터로 카드 0개인 칼럼 → "No matching cards" placeholder 표시
  - [ ] `bun run test -- search-filter` 통과
- **커밋**: `feat: add search and filter with combined AND logic`

---

### Task 10: 다크모드

- **시나리오**: KANBAN-019, 020, 022
- **참조 규칙**:
  - `.claude/skills/shadcn/rules/styling.md` (dark: 수동 오버라이드 금지, 시맨틱 토큰 사용)
  - `.claude/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md` (FOUC 방지)
- **구현 대상**:
  - `components/kanban/dark-mode-toggle.tsx` — Switch 토글 컴포넌트
  - `lib/store.ts` 수정 — darkMode 상태 + persist
  - `app/layout.tsx` 수정 — html 요소에 dark 클래스 동기화
  - `__tests__/dark-mode.test.tsx` — 다크모드 단위 테스트
- **수용 기준**:
  - [ ] 라이트 모드에서 토글 클릭 → html에 dark 클래스 추가
  - [ ] 다크 모드에서 토글 클릭 → dark 클래스 제거
  - [ ] 새로고침 후 다크모드 유지 (localStorage)
  - [ ] FOUC 방지: 새로고침 시 라이트→다크 깜빡임 없음 (inline script로 초기 클래스 설정)
  - [ ] `bun run test -- dark-mode` 통과
- **커밋**: `feat: add dark mode toggle with localStorage persistence`

---

### Task 11: Spec 테스트 통과 확인

- **시나리오**: KANBAN-001 ~ KANBAN-027 전체
- **참조 규칙**: `CLAUDE.md` (TDD 워크플로우 — Green 확인)
- **구현 대상**:
  - 전체 spec 테스트 실행 및 실패 항목 수정
  - 구현이 spec.yaml과 맞지 않으면 구현을 수정 (spec 테스트 수정 금지)
- **수용 기준**:
  - [ ] `bun run test` 실행 시 전체 테스트 통과 (spec + 단위)
  - [ ] KANBAN-001 ~ KANBAN-027 모든 시나리오 Green
- **커밋**: `fix: ensure all kanban spec tests pass`

---

## 미결정 사항

- 없음
