# Validation / Message Catalog / Date Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three small, independent foundation utilities to the template so feature code stops re-inventing them: (1) a thin **zod schema factory** layer with consistent, configurable validation; (2) a **validation message catalog** living inside the existing i18n system (single source of truth, no hardcoded inline Vietnamese); (3) a **date/time wrapper** over the already-installed `date-fns` for relative time ("1 phút trước") and standard VN formats.

**Scope:** Items #1, #2, #4 from the 2026-06-17 template-improvement review. **Out of scope (separate future plans):** table column-builder hooks (#3), `format.ts` currency/number helpers, API-error normalization, status→Badge helpers (#5).

**Tech Stack:** React 19, TypeScript (strict, no `any` — use `unknown`/generics), `zod@4`, `react-intl@7`, `date-fns@4`. **No new dependencies are added by this plan** — all three libs are already in `package.json`.

---

## Current Problem

- **Validation is duplicated and hardcoded.** `src/examples/employees/schemas/employee.schema.ts` writes messages inline (`.min(1, 'Họ tên không được để trống')`). Every new schema re-types the same VN strings → drift, untranslatable, inconsistent.
- **No shared validation message catalog.** `src/i18n/messages/{vi,en}.ts` only covers `common.*`; there is no `validation.*` namespace. Error wording cannot be reused or localized.
- **No date helper.** `date-fns` is used ad-hoc inside layout demos; there is no project convention for "X phút trước" or VN date formatting, and no locale wiring to i18n.

---

## Decisions (lock before coding)

- **Do not build a new validation engine or custom "error codes."** zod v4 already exposes `issue.code` (`ZodIssueCode`). The factory only configures constraints and supplies messages; business rules (cross-field, e.g. end > start) stay in per-schema `.refine()`, never in the factory.
- **Messages live in the existing i18n catalog**, not a parallel `constants/messages.ts`. Add a `validation.*` namespace to `vi.ts`/`en.ts`.
- **No new date library.** Use `date-fns` + its `vi` locale. Do not add dayjs/luxon/moment.
- **Foundation only, no UI restyle.** This plan touches `src/lib/**`, `src/i18n/messages/**`, and refactors the one existing example schema as proof. It must not change any rendered styling → no Visual Regression Contract needed, but `/` and the employees example must still build and behave identically.
- New code uses **named exports**, `import type` for types, and is fully typed (no `any`).

---

## Task 1 — Validation message catalog (#2, foundation for #1)

- [ ] Add a `validation.*` namespace to `src/i18n/messages/vi.ts` and mirror in `en.ts`. Keys cover the constraints the factory needs, with `{param}` placeholders:
  - `validation.required` → "Không được để trống"
  - `validation.string.min` → "Tối thiểu {min} ký tự"
  - `validation.string.max` → "Tối đa {max} ký tự"
  - `validation.string.pattern` → "Giá trị không hợp lệ"
  - `validation.number.min` → "Tối thiểu là {min}"
  - `validation.number.max` → "Tối đa là {max}"
  - `validation.number.int` → "Phải là số nguyên"
  - `validation.email` → "Email không hợp lệ"
  - `validation.phoneVN` → "Số điện thoại không hợp lệ"
- [ ] Provide a tiny formatter `formatMessage(key, params?)` usable **outside React** (the schema factory runs at module scope, not in a component). Put it in `src/lib/validation/messages.ts`: read from `messagesByLocale[currentLocale]`, do `{param}` interpolation. Reuse `DEFAULT_LOCALE` from `src/i18n/config.ts`; expose a setter or read the active locale so it stays in sync with `i18n-provider`.
- [ ] Keep label vs. error separation: messages are field-agnostic ("Tối thiểu {min} ký tự"), the field name is prepended by the form layer, not baked into the catalog.

**Verify:** `npm run build` clean; a unit test asserts `formatMessage('validation.string.min', { min: 3 })` → `'Tối thiểu 3 ký tự'` and falls back gracefully on a missing key.

## Task 2 — Schema factory (#1)

- [ ] Create `src/lib/validation/factories.ts` exporting thin builders over zod v4 that pull messages from Task 1:
  - `vString({ required?, min?, max?, pattern?, trim? })` → `ZodString`
  - `vNumber({ required?, min?, max?, int? })` → `ZodNumber`
  - `vEmail({ required? })`, `vPhoneVN({ required? })`
  - `vRequiredEnum(values)` helper for the common "chọn ít nhất một" / required-select case
- [ ] Each builder composes zod chains and passes the catalog message into each constraint (`.min(min, formatMessage('validation.string.min', { min }))`, etc.). `required: false` → `.optional()`.
- [ ] Barrel `src/lib/validation/index.ts` re-exports factories + `formatMessage`. Add a short header comment pointing to `docs/01-coding-convention.md` §8.
- [ ] **No business logic inside factories** — document in the file header that cross-field rules belong in per-schema `.refine()`.

**Verify:** `npm run build` clean; unit tests in `src/lib/validation/factories.test.ts` cover: min/max boundary success+failure, optional vs required, email + phoneVN regex, and that the failure message equals the catalog string.

## Task 3 — Refactor the employees example schema (proof of adoption)

- [ ] Rewrite `src/examples/employees/schemas/employee.schema.ts` to use the factories instead of inline strings, keeping the **exact same validation behavior** (same min/max, same enum requirements). This is the canonical reference other devs copy, so it must demonstrate the new pattern.
- [ ] Confirm `EmployeeFormValues` inferred type is unchanged.

**Verify:** existing employees example builds and its form validates identically; `npm run test:run` green.

## Task 4 — Date/time wrapper (#4)

- [ ] Create `src/lib/date.ts` over `date-fns` + `date-fns/locale/vi`, all functions accepting `Date | string | number`:
  - `formatRelative(value)` → `formatDistanceToNow(..., { addSuffix: true, locale: vi })` → "1 phút trước"
  - `formatDate(value)` → `dd/MM/yyyy`
  - `formatDateTime(value)` → `dd/MM/yyyy HH:mm`
  - `formatTime(value)` → `HH:mm`
  - guard invalid/undefined input → return `''` (do not throw)
- [ ] Locale is chosen from the active app locale (wire to i18n; `vi` default). Keep the locale lookup in one place so `en` can be added later without touching call sites.
- [ ] Optional `src/components/ui/relative-time.tsx`: `<RelativeTime value=... />` renders `formatRelative` as text with `title={formatDateTime(value)}` (relative label, absolute tooltip — standard UX). Named export, composes nothing raw beyond a `<time>` element.

**Verify:** `npm run build` clean; unit test for `formatRelative` (mock "now"), `formatDate`, and invalid-input guard.

---

## Definition of Done

- `npm run build` exits 0 and `npm run test:run` is green.
- No `any` introduced; named exports; `import type` used; files well under 400 lines.
- No hardcoded validation strings remain in `src/examples/employees/schemas/employee.schema.ts`.
- No new dependency in `package.json`.
- No rendered-style change: `/` and the employees example look and behave exactly as before.

## Suggested order

Task 1 → Task 2 → Task 3 → Task 4. Tasks 1–3 are a chain; Task 4 is independent and can be done in parallel.
