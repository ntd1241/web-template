# Search Util + Searchable Combobox (Input batch — Phase A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phase A of the Vacom input-component port: (1) a **Vietnamese accent-insensitive search utility** (`src/lib/search.ts`) the template currently lacks, and (2) a generic **searchable Select / Combobox** (`src/components/ui/combobox`) built on the existing `Command` (cmdk) + `Popover` primitives. Rewritten clean — the prior project's versions carry `any`, infra coupling, Metronic tokens, and a DOM-scanning scroll hack we will NOT copy.

**Scope:** search util + Combobox only. **Phase B (separate plan, later):** MultiSelect with chips, NumericInput (`react-number-format`), SearchInput. Reference: `C:\Users\PC\Vacom\vacom-online-2026\src\components\ui\custom-select.tsx`, `inputs\select-input.tsx`, `src\lib\search.ts`, `src\lib\string.ts`.

**Tech Stack:** React 19, TypeScript strict (no `any`), `cmdk` (already installed, wrapped by `src/components/ui/command.tsx`), Radix Popover (`src/components/ui/popover.tsx`), CVA. **No new dependencies.** Use the semantic token classes just standardized (`bg-field`/`border-border`/`text-foreground`/`text-muted-foreground`) — not raw `admin-*`.

---

## What the prior project did, and what we keep vs. fix

Good ideas to keep: generic `SelectOption<T>`, `manualFilter` flag for async/server-side filtering, popover trigger + Command searchable body, accent-insensitive matching.

Do NOT copy:
- The `useEffect` scroll-to-selected hack in `select-input.tsx` that does `document.querySelectorAll('[cmdk-item]')`, scans for `.text-primary.opacity-100`, and `setTimeout(100)` + manual `scrollTo`. Fragile and global-DOM-coupled. Omit scroll-to-selected in v1 (cmdk already keeps the active item in view); if needed later, do it with a ref, not a global query.
- `any` (`CustomSelectProps<T = unknown>` is fine; avoid `any` elsewhere).
- Coupling to `@/lib/search`/`@/lib/string` from that repo — we create our own in this task.
- Metronic tokens — use semantic classes.

## Decisions (lock before coding)

- Matching = normalize-then-`includes` (same approach as the reference; no fuzzy). Normalization: lowercase + strip Vietnamese diacritics (Unicode NFD, remove combining marks `̀-ͯ`, map `đ/Đ → d`). Pure function, no deps.
- `Combobox` is a single-select searchable popover. Multi-select is Phase B.
- The Button trigger: reuse `src/components/ui/button.tsx`. Check whether it supports a `mode="input"` variant; if not, use `variant="outline"` with `justify-between` + field classes. Do not invent new Button variants here.
- Generic value type: option `value` is always a `string` (the selected key); `data?: T` carries the rich payload. `onChange(value: string)` + optional `onSelect(option | undefined)`.

---

## Task 1 — Vietnamese search utility

- [ ] Create `src/lib/string.ts` (or a `normalizeVi` in `src/lib/search.ts` — one file is fine): `normalizeVi(input: string | null | undefined): string` → lowercased, diacritics-stripped, `đ→d`. Trim. Pure, no deps.
- [ ] Create `src/lib/search.ts`: `searchMatch(text: string | null | undefined, query: string | null | undefined): boolean` → empty query ⇒ `true`; else `normalizeVi(text).includes(normalizeVi(query))`. Named exports.

**Verify:** unit tests `src/lib/search.test.ts` — accent-insensitive (`'Nguyễn' matches 'nguyen'`), case-insensitive, `đ`↔`d`, empty query ⇒ true, null-safe.

## Task 2 — Combobox component

- [ ] Create `src/components/ui/combobox/` with:
  - `combobox.tsx`: `Combobox<T>` composing `Popover` + `Button` trigger + a `Command` body. Props: `value?: string`, `onChange?: (value: string) => void`, `onSelect?: (option: ComboboxOption<T> | undefined) => void`, `options: ComboboxOption<T>[]`, `placeholder?`, `searchPlaceholder?` (default 'Tìm...'), `emptyMessage?` (default 'Không có kết quả'), `disabled?`, `manualFilter?` (when true, skip internal filtering — caller filters, e.g. async), `renderOption?`, `triggerContent?`. Type `ComboboxOption<T> = { value: string; label: ReactNode; searchableText?: string; data?: T; disabled?: boolean }`.
  - Internal filtering uses `searchMatch` over `searchableText ?? (typeof label === 'string' ? label : value)`. Set `Command`'s `shouldFilter={false}` and filter the list yourself (so accent-insensitive logic is used, and `manualFilter` works).
  - Selecting an option calls `onChange`/`onSelect` and closes the popover. Re-selecting the current value clears it (`''` / `undefined`) — match reference behavior, or keep simple single-select; document the choice.
  - PopoverContent width `w-(--radix-popover-trigger-width)`, `p-0`; show a `Check` on the selected item. Semantic tokens only.
  - `index.ts` barrel.
- [ ] Named exports; no `any`; `import type`; file < 400 lines (split the list body into `combobox-list.tsx` if needed).

**Verify:** `npm run build` clean; tests `combobox.test.tsx` (testing-library + user-event): opens on trigger click; typing an accent-free query filters accented options; selecting an option fires `onChange` with the value and closes; empty state shows `emptyMessage`; `manualFilter` shows all passed options unfiltered.

## Task 3 — Usage proof (dev example, lightweight)

- [ ] Add a minimal real usage so devs have a copy-paste reference: a small `Combobox` in the employees example toolbar OR a short section in an existing example page (a single-select filter, e.g. filter by role) wired to local state. Keep it non-invasive — do not rework the employees data/query flow; if a clean insertion point doesn't exist, instead add a tiny commented usage snippet in the combobox file header and skip page wiring (note this in the summary so the reviewer can browser-check).

**Verify:** if wired into a page, the reviewer browser-checks the popover at 1366px; otherwise the testing-library interaction test stands in.

---

## Definition of Done

- `npm run build` exits 0; `npm run test:run` green.
- No `any`; named exports; `import type`; semantic tokens (no raw `admin-*`); no new dependency.
- No scroll-to-selected DOM hack; no global `document.querySelectorAll('[cmdk-item]')`.
- Combobox composes the existing `Command`/`Popover`/`Button` — not forked copies.

## Suggested order

Task 1 → Task 2 → Task 3. Task 1 is the dependency.
