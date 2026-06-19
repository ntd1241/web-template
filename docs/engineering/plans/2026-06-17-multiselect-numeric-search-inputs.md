# MultiSelect + NumericInput + SearchInput (Input batch — Phase B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phase B of the Vacom input port — three reusable form inputs, rewritten clean: (1) **MultiSelect** (searchable multi-select with selected-chips trigger), (2) **NumericInput** (VN-formatted numeric field via `react-number-format`), (3) **SearchInput** (debounced search field with clear button). Build on the Phase A foundation (`Combobox`/`Command`/`Popover`, `searchMatch`) and the existing `Input`/`Button`/`Badge` primitives.

**Scope:** these three components + usage proofs. Reference: `C:\Users\PC\Vacom\vacom-online-2026\src\components\ui\multi-select.tsx`, `inputs\numeric-input.tsx`, `inputs\search-input.tsx`.

**Tech Stack:** React 19, TypeScript strict (no `any`), `cmdk`/Radix Popover (wrapped), `react-number-format` (**already added to package.json by the supervisor before this task — do NOT run npm install**), existing `src/lib/search.ts`, `src/lib/helpers.ts` (`debounce`). Semantic token classes only (`bg-field`/`border-border`/`text-foreground`/`text-muted-foreground`).

---

## What the prior project did, and what we keep vs. fix

Keep: accent-insensitive matching, grouping + per-option counts (MultiSelect), `react-number-format` for VN separators, debounced search with clear.

Do NOT copy:
- `any` casts (`(onChange as any)` in numeric-input; `as any` in search-input).
- Coupling to `@/lib/codes` (`DATA_CODES.EMPTY`), `@/lib/react-node-to-string` (`getNodeString`), `@/lib/search` (`SearchUtils`) — use `searchMatch` from `src/lib/search.ts`; for label-to-string use a tiny local helper.
- Metronic tokens.
- The Vacom `multi-select.tsx` is a bare Command body (filter-panel) with no trigger and no selected-chips display — we make it a real form field with a Popover trigger + chips.
- Do NOT change the template `Input`'s `onChange(event)` contract.

## Decisions (lock before coding)

- MultiSelect value = `string[]`. Trigger shows selected options as removable chips (`Badge` + X), with overflow collapse ("+N") past a small limit; empty → placeholder. Dropdown = `Command` with `shouldFilter={false}` + `searchMatch`, checkbox-style items, plus "Chọn tất cả"/"Bỏ chọn" actions.
- Grouping: support ONE level via an optional `group?: string` on each option (render grouped headers). Do NOT implement arbitrary deep recursive nesting (the fragile part of the reference). Per-option `count?` renders right-aligned.
- NumericInput composes `react-number-format`'s `NumericFormat` with the template `Input` look (reuse `inputVariants` from `src/components/ui/input.tsx`); `thousandSeparator="."`, `decimalSeparator=","`, `allowNegative=false` default. Expose `onValueChange` (number/string) cleanly — NO `any`.
- SearchInput is controlled-ish: `value`, `onSearch(value)` debounced (default 300ms via `debounce` from `helpers.ts`), local immediate input state, a leading search icon, a trailing clear (X) button that cancels the pending debounce. No `as any`.

---

## Task 1 — SearchInput (`src/components/ui/inputs/search-input.tsx`)

- [ ] Props extend the template `Input` props (size variants etc.): `value?: string`, `onSearch?: (value: string) => void`, `debounceMs?: number = 300`, `placeholder?`. Leading `Search` icon, trailing `X` button (shown only when non-empty) that clears + cancels pending debounce + fires `onSearch('')`.
- [ ] Keep a local input value for instant typing; debounce the `onSearch`. Sync local when `value` prop changes. Clean up the debounce on unmount.
- [ ] Semantic tokens; named export.

**Verify:** `npm run build` clean; test (fake timers): typing fires `onSearch` once after the debounce window; clear button empties + fires `onSearch('')`.

## Task 2 — NumericInput (`src/components/ui/inputs/numeric-input.tsx`)

- [ ] Wrap `NumericFormat` from `react-number-format`. Reuse `inputVariants` for styling, `text-right tabular-nums`. Props: `value?: number | string | null`, `onValueChange?: (value: number | undefined) => void`, `allowNegative?`, `decimalScale?`, `thousandSeparator` default `.`, `decimalSeparator` default `,`, plus pass-through. Convert empty → `undefined`. NO `any`.
- [ ] Named export; semantic tokens; `import type`.

**Verify:** `npm run build` clean; test: rendering a number shows grouped VN format ("1.234.567"); typing updates fire `onValueChange` with the numeric value; empty → `undefined`.

## Task 3 — MultiSelect (`src/components/ui/multi-select/`)

- [ ] `multi-select.tsx`: `MultiSelect<T>` = Popover + trigger (Button mode="input" showing chips/placeholder + ChevronsUpDown) + `Command` body. Option type `MultiSelectOption<T> = { value: string; label: ReactNode; searchableText?: string; group?: string; count?: number; data?: T; disabled?: boolean }`. Props: `value?: string[]`, `onChange?: (values: string[]) => void`, `options`, `placeholder?`, `searchPlaceholder?`, `emptyMessage?`, `disabled?`, `maxChips?: number = 3`.
- [ ] Trigger renders selected as removable `Badge` chips (click X removes); beyond `maxChips`, show "+N". Items show a check/checkbox state; `searchMatch` filters; grouped by `group`; counts right-aligned; "Chọn tất cả" / "Bỏ chọn tất cả" actions. Popover stays open on item toggle (multi-select UX).
- [ ] Decouple: local `nodeToString(label)` helper for search fallback; no external lib coupling. `index.ts` barrel. Split list body into `multi-select-list.tsx` if nearing 400 lines.

**Verify:** `npm run build` clean; tests: toggling options updates `value`; chips render + removable; accent-free query filters accented labels; "Chọn tất cả"/"Bỏ chọn" work; grouped rendering.

## Task 4 — Usage proofs (employees example, non-invasive)

- [ ] Replace the inline search box in the employees toolbar with `SearchInput` (keep the same debounced-query behavior — do not change query semantics).
- [ ] Add a `MultiSelect` multi-role filter in the toolbar wired to local state (alongside / replacing the single-role `Combobox` from Phase A — your call; keep it coherent).
- [ ] NumericInput: if no natural employees field exists, add a short commented usage snippet in its file header and note it (no forced page wiring). Otherwise demo it in an example.

**Verify:** browser-check the employees example at 1366px — SearchInput debounces + clears, MultiSelect chips + filtering + grouping render correctly, popovers styled with semantic tokens.

---

## Definition of Done

- `npm run build` exits 0; `npm run test:run` green.
- No `any`; named exports; `import type`; `cn()`; semantic tokens; files < 400 lines.
- No coupling to `@/lib/codes`/`react-node-to-string`/external `SearchUtils`; uses `searchMatch` + local helpers.
- `react-number-format` is the only new dependency (already added).
- Browser-verified usage in the employees example.

## Suggested order

Task 1 (SearchInput) and Task 2 (NumericInput) are independent and simple; Task 3 (MultiSelect) is the complex one; Task 4 wires the proofs. Do 1 → 2 → 3 → 4.
