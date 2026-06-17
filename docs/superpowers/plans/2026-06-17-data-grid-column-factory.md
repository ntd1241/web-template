# DataGrid Column Factory + Persisted Visibility + StatusBadge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a thin, fully-typed **column-factory layer on top of the existing `DataGrid`** so feature pages stop hand-writing repetitive `ColumnDef` objects. Ship the common read-only column builders, a generic **`StatusBadge`** (the deferred review item #5-badge), and **persisted column visibility** via an injected storage adapter. Reverse-engineered from a prior project's column-hook system (`C:\Users\PC\Vacom\vacom-online-2026\src\components\ui\tables`) but **rewritten** to fix its problems — see "What we are NOT copying".

**Scope:** Phase 1 (factory + StatusBadge) + Phase 2 (persisted visibility). **Out of scope / deferred to a later phase:** editable `useFormFieldColumn` (react-hook-form grid cells), column DnD/reorder, resizing-default changes, server-side filter functions, currency *input* masking.

**Tech Stack:** React 19, TypeScript strict (**no `any`** — generics/`unknown`), TanStack React Table v8, existing `DataGrid`/`DataGridColumnHeader`/`Badge` primitives, plus the just-landed `src/lib/date.ts` and `src/lib/format.ts`. **No new dependencies.**

---

## Why (the prior system's problems we are fixing)

The reference column-hook system has good *ideas* (declarative typed accessors) but several issues we must not carry over:

1. `any` throughout (`UseTableColumnProps<TData = any>`, `Table<any>`, `FilterFn<any>`, `updaterOrValue: any`).
2. Hard coupling to project-specific infra (`@/lib/codes`, `@/lib/search`, `@/lib/storage`).
3. `useSafeCallback` (setState-after-unmount guard) — an unnecessary anti-pattern on React 18+.
4. **Broken memoization:** per-column `useMemo` deps include fresh objects/functions (`props`, `renderCell`, `meta`) → columns recreated every render → cells remount. The author worked around this only in the form-field hook (refs + `eslint-disable`).
5. **Hook-per-column** forces fixed column count/order (rules of hooks); can't build columns in a loop/conditionally.
6. Opinionated table defaults (`enableSorting:false`, `size:200`, resizing) baked into the builder, conflicting with the template `DataGrid` defaults — two sources of truth.
7. `useStringColumn` wraps **every** cell in a Tooltip unconditionally (duplicate text, wasted DOM).
8. Cells use Metronic tokens (`text-mono`, `text-secondary-foreground`), not `admin-*`.
9. Forks its own `data-grid*.tsx` copies — the template already owns these.
10. Date formatting hardcoded (`format(d,'dd/MM/yyyy')`) instead of a shared date util.

## Decisions (lock before coding)

- **Pure factory, not hooks.** `createColumnHelpers<TRow>()` returns builder functions that each return a typed `ColumnDef<TRow>`. Consumers assemble the array inside **one** `useMemo` → memo is correct, no remount bug, no rules-of-hooks rigidity. This replaces the hook-per-column model.
- **Compose the existing `DataGrid` layer — do NOT fork it.** Reuse `DataGridColumnHeader`, the `Badge` CVA, and `ColumnMeta` (`headerClassName`/`cellClassName`). If a new badge look is needed, add a variant to `badge.tsx` CVA per `docs/06` §0.1 — never per-page `bg-*`.
- **Integrate the foundation libs:** date columns call `formatDate`/`formatDateTime`/`formatRelative` (`src/lib/date.ts`); currency/number/percent columns call `src/lib/format.ts`.
- **Zero `any`.** `TRow` flows through every builder; accessors are `get: (row: TRow) => TValue`.
- **Tooltip is opt-in** (`tooltipOnTruncate?: boolean`), not automatic on every text cell.
- **Storage is injected**, generic, and resilient (guards JSON parse + quota/SSR). No coupling to a domain-specific store.
- **Visual parity:** the employees example refactor must look identical at 1366px and 1920px.

---

## Task 1 — Column factory (read-only builders)

Create `src/components/ui/data-grid-columns/column-factory.tsx` exporting `createColumnHelpers<TRow>()` returning builders, each producing `ColumnDef<TRow>`:

- [ ] `text({ id, header, get, tooltipOnTruncate?, headerClassName?, cellClassName? })` — `get: (row) => string | null | undefined`. Truncates with `cn`-based classes; when `tooltipOnTruncate`, wrap in the existing `Tooltip` **only** (single source of the value).
- [ ] `number({ id, header, get, options? })` → renders `formatNumber(get(row), options)`, right-aligned via `cellClassName`.
- [ ] `currency({ id, header, get })` → `formatCurrencyVND`, right-aligned.
- [ ] `percent({ id, header, get, fractionDigits? })` → `formatPercent`.
- [ ] `date({ id, header, get, mode? })` where `mode: 'date' | 'datetime' | 'relative'` (default `'date'`) → delegates to `src/lib/date.ts`; for `'relative'` render the `<RelativeTime>` component.
- [ ] `badge({ id, header, get, config })` — see Task 2 (`StatusBadge`).
- [ ] `index({ id?, header? })` — 1-based row number column.
- [ ] `select()` — row-selection checkbox column (header + cell) using the existing `Checkbox` primitive.
- [ ] `actions({ id?, header?, cell })` — right-pinned action cell; `cell: (row: TRow) => ReactNode`.
- [ ] `custom({ id, header, cell, ...meta })` — escape hatch for bespoke cells.
- [ ] All builders render the header through `DataGridColumnHeader` (pass `title`, optional `visibility`) and forward `headerClassName`/`cellClassName` into `meta`. Keep each builder small; the file stays under 400 lines (split into `cells.tsx` if needed).
- [ ] `index.ts` barrel for the folder.

**Verify:** `npm run build` clean; unit tests `column-factory.test.tsx` assert each builder yields a `ColumnDef` with the right `id`/`accessor`, that the cell renders the formatted value (date/currency/number), and that `tooltipOnTruncate:false` produces no Tooltip wrapper.

## Task 2 — Generic StatusBadge (#5-badge)

- [ ] Create `src/components/ui/data-grid-columns/status-badge.tsx`:
  - `type StatusBadgeConfig<TStatus extends string> = Record<TStatus, { label: string; variant?: BadgeProps['variant']; dotClassName?: string; className?: string }>`
  - `StatusBadge<TStatus>({ status, config })` — composes the existing `Badge` (+ `BadgeDot` when `dotClassName` set). Named export, `admin-*` tokens only.
- [ ] `column-factory`'s `badge()` builder consumes a `StatusBadgeConfig` to render the cell.

**Verify:** unit test renders `StatusBadge` for each configured status and asserts label + variant; falls back gracefully if a status is missing from the config (render the raw status string, do not crash).

## Task 3 — Persisted column visibility

- [ ] Create a generic storage adapter `src/lib/storage.ts`: `getStorageItem<T>(key): T | undefined` and `setStorageItem<T>(key, value): void`, both wrapped in try/catch (JSON parse errors, `localStorage` unavailable, quota) returning/no-oping safely. No domain coupling.
- [ ] Create `src/components/ui/data-grid-columns/use-persisted-column-visibility.ts`: `usePersistedColumnVisibility(storageKey: string, defaults?: VisibilityState)` → `{ columnVisibility, onColumnVisibilityChange }` ready to spread into `useReactTable({ state, onColumnVisibilityChange })`. Lazy-init from storage; persist on change. **Do not** reintroduce `useSafeCallback` — rely on plain state setters.

**Verify:** unit test (jsdom) — set visibility, assert it persists to and rehydrates from the storage adapter; corrupt/missing storage falls back to `defaults` without throwing.

## Task 4 — Adopt in the employees example (proof + visual parity)

- [ ] Refactor `src/examples/employees/hooks/use-employee-columns.tsx` to build its columns via `createColumnHelpers<Employee>()` inside one `useMemo`. Move the status styling into a `StatusBadgeConfig` and render via `col.badge(...)`; keep role badges as a `custom` cell if their multi-badge layout doesn't fit `badge()`.
- [ ] Wire `usePersistedColumnVisibility` into the employees list table (storage key e.g. `examples.employees.columnVisibility`).
- [ ] Keep the rendered result **identical** — same columns, order, widths, badge colors.

**Verify:** `npm run build` clean, `npm run test:run` green, and **browser check the employees example at 1366px and 1920px** — confirm no visual regression vs. the current grid (screenshot).

---

## What we are NOT copying (explicit guard)

`useSafeCallback`, the per-column `useMemo`-with-unstable-deps pattern, hook-per-column, baked-in table defaults, unconditional cell tooltips, forked `data-grid*` components, `@/lib/codes` / `@/lib/search` coupling, Metronic color tokens.

## Definition of Done

- `npm run build` exits 0; `npm run test:run` green.
- No `any`; named exports; `import type`; `cn()` for conditional classes; files < 400 lines.
- Existing `DataGrid`/`Badge`/`DataGridColumnHeader` reused, not forked; new badge looks (if any) added to the `badge.tsx` CVA.
- Employees example visually unchanged at 1366px and 1920px.

## Suggested order

Task 1 + Task 2 together (factory needs StatusBadge for `badge()`), then Task 3, then Task 4 (depends on all).
