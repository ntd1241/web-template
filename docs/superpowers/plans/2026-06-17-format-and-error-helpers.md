# Format Helpers + Error Message Helpers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two small, independent foundation utilities (review item #5, scoped): (1) a **number/currency/percent format module** over `Intl.NumberFormat('vi-VN')`; (2) thin **error-message helpers** (`getErrorMessage` / `toastError`) that turn an `unknown` thrown value into a user-facing Vietnamese message and a toast, building on the already-normalized `ApiError` and the i18n message catalog.

**Scope:** format helpers + error-message helpers only. **Out of scope (defer, will be discussed with #3):** status→Badge generic component, table column-builder hooks, currency *input* parsing/masking.

**Tech Stack:** React 19, TypeScript strict (no `any` — `unknown`/generics), `sonner` (toast, already wired via `<Toaster/>` in `src/App.tsx`), `@tanstack/react-query`. **No new dependencies.** `Intl` is built-in; do NOT add a currency/number lib.

---

## Current State (read before coding)

- `src/lib/axios.ts` already normalizes every axios failure into `ApiError { message, status?, errors? }` (`src/types/api.types.ts`). The interceptor sets a default VN message when the server gives none.
- Examples handle errors ad-hoc: `onError: (error: ApiError) => toast.error(error.message)` (see `src/examples/employees/api/employee.queries.ts`). This breaks down when the error is NOT an `ApiError` — a thrown JS `Error`, a mock rejection, or react-query handing back `unknown`.
- `src/lib/validation/messages.ts` (just landed) exposes a module-scope `formatMessage(key, params?)` reading the i18n catalog. The error helper reuses it for fallback wording — do NOT create a parallel message source.
- No number/currency formatting helper exists anywhere yet.

## Decisions (lock before coding)

- **Reuse `ApiError`, don't re-normalize.** `getErrorMessage` only *reads* a message out of whatever it's given; it must not replace or duplicate the axios interceptor.
- **Accept `unknown`.** The helpers must be safe on `ApiError`, native `Error`, `string`, and anything else — never throw, always return a string.
- **Fallback wording comes from the i18n catalog** (`common.state.error` already exists: "Đã có lỗi xảy ra"). Add a `common.error.unknown` key only if a distinct fallback is wanted; otherwise reuse `common.state.error`.
- **`Intl` formatters are created once at module scope** (constructing `Intl.NumberFormat` per call is measurably slow), not inside each function.
- Named exports; `import type` for types; files well under 400 lines; no `any`.

---

## Task 1 — Number / currency / percent format (`src/lib/format.ts`)

- [ ] Create `src/lib/format.ts` with module-scope `Intl.NumberFormat('vi-VN', …)` instances and these named functions, all accepting `number | null | undefined` and returning `''` for nullish/`NaN` (never throw):
  - `formatNumber(value, options?)` → grouped VN number ("1.234.567")
  - `formatCurrencyVND(value)` → "1.234.567 ₫" (style currency, `currency: 'VND'`, no fraction digits)
  - `formatPercent(value, fractionDigits = 0)` → expects a ratio (`0.125` → "12,5%") — document the input convention in the function header
  - `formatCompact(value)` → compact notation ("1,2 N" / "1,2 Tr") via `notation: 'compact'`
- [ ] Header comment: VN locale uses `.` for thousands and `,` for decimals — note this so callers don't double-format.

**Verify:** `npm run build` clean; unit tests `src/lib/format.test.ts` cover grouping, currency suffix, percent ratio conversion, and the nullish/`NaN` → `''` guard for each function.

## Task 2 — Error-message helpers (`src/lib/errors.ts`)

- [ ] Create `src/lib/errors.ts`:
  - `isApiError(value: unknown): value is ApiError` — narrow on the `{ message: string }` shape (object with a string `message`, optional numeric `status`).
  - `getErrorMessage(error: unknown): string` — return, in priority order: `ApiError.message` → native `Error.message` → the `error` itself if it's a non-empty string → catalog fallback (`formatMessage('common.state.error')`). Always a non-empty string.
  - `getFieldErrors(error: unknown): Record<string, string[]> | undefined` — pull `ApiError.errors` for mapping into react-hook-form (`setError`); `undefined` when absent.
  - `toastError(error: unknown): void` — `toast.error(getErrorMessage(error))` (import `toast` from `sonner`). Keep it dependency-light; no React imports.
- [ ] Do NOT touch `src/lib/axios.ts` — these helpers sit on top of the existing normalization.

**Verify:** `npm run build` clean; unit tests `src/lib/errors.test.ts` cover each branch of `getErrorMessage` (ApiError, Error, string, unknown→fallback), `isApiError` true/false, and `getFieldErrors` present/absent. For `toastError`, mock `sonner`'s `toast.error` and assert it's called with the resolved message.

## Task 3 — Adopt in the employees example (proof)

- [ ] Update `src/examples/employees/api/employee.queries.ts`: replace `onError: (error: ApiError) => toast.error(error.message)` with `onError: (error) => toastError(error)` (let the type be `unknown`). Keep the success toast as-is. This makes the example the canonical reference for the new helper.
- [ ] Remove the now-unused `ApiError` import there if nothing else needs it.

**Verify:** employees example builds and behaves identically; `npm run test:run` green.

---

## Definition of Done

- `npm run build` exits 0 and `npm run test:run` green.
- No `any`; named exports; `import type`; no new dependency.
- `src/lib/axios.ts` untouched; no parallel message system (errors reuse `formatMessage`).
- No rendered-style change.

## Suggested order

Task 1 and Task 2 are independent (do in parallel); Task 3 depends on Task 2.
