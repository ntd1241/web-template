# Semantic Token Migration (stop using raw `admin-*` in components) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the "two parallel token namespaces" noise by making components consume the **semantic shadcn token layer** (`bg-card`, `bg-muted`, `border-border`, `text-secondary-foreground`, …) instead of reaching into the **raw `admin-*` palette** classes (`bg-admin-surface-alt`, `border-admin-neutral-100`, `text-admin-blue-dark`, …). Keep `--admin-*` as the **palette definition** (the hex source of truth) — it is NOT removed. The win: one consumption surface, **dark mode works automatically** (today the `.dark` block redefines semantic tokens but not `--admin-*`, so every raw `admin-*` class is dark-mode-broken), and brand changes happen in one `:root` block.

**Explicitly NOT this plan:** deleting `--admin-*` and inlining hex into semantic tokens. That loses the named palette + scales and forces hex/extra tokens for admin-only shades that have no semantic home. We keep the palette; we change what *components* reference.

**Tech Stack:** Tailwind 4 `@theme inline`, `src/styles/globals.css`, CVA components in `src/components/ui/*`. No dependency or behavior change — pure restyle.

---

## Current State (measured)

- `src/styles/globals.css` defines three layers: raw palette `--admin-*` → semantic tokens (`--primary: var(--admin-primary)`, `--secondary: var(--admin-blue-bg)`, `--border: var(--admin-neutral-100)`, `--input: var(--admin-neutral-200)`, `--muted: var(--admin-neutral-bg)`, `--secondary-foreground: var(--admin-blue-dark)`, …) → `@theme inline` exposes BOTH as Tailwind classes.
- **13 component files** use raw `admin-*` classes (~100+ occurrences). Hotspots: `bg-admin-surface-alt` ×15, `border-admin-neutral-100` ×12, `text-admin-neutral-400` ×8, `rounded-admin-control` ×8, `text-admin-blue-dark` ×7, `bg-admin-page` ×7, `bg-admin-surface` ×5.
- The `.dark` block redefines **0** `--admin-*` tokens → all raw `admin-*` usages stay light in dark mode.
- This touches `main-layout` components, so the **`/` Visual Regression Contract applies** (verify at 1366px and 1920px).

## Decisions (lock before coding)

- `--admin-*` stays as the palette. Migrate component **class usage** only.
- **Migrate to semantic** where an exact/near-exact semantic token already exists (table below). These are 1:1 value-equal today, so no visual change in light mode.
- **Keep raw `admin-*`** for genuinely admin-specific roles with no semantic home: status colors (`success`/`amber`/`violet`/`red` bg/dot/text/border used for badges & status pills), the admin radii (`rounded-admin-card`/`-control`/`-field`), and admin layout dims (`spacing-admin-*`). Using the palette directly there is correct.
- **Decide dark mode posture** (pick one, record in the plan PR): (a) add `.dark` overrides for the kept admin-only roles so badges/pills are dark-aware too, or (b) explicitly declare dark mode out-of-scope for this template for now. Do not leave it implicitly half-broken.

## Migration map (exact value-equal → safe to swap)

| Raw `admin-*` class | → Semantic class | Note |
| --- | --- | --- |
| `bg-admin-surface` | `bg-background` / `bg-card` | both = `--admin-surface` (#fff) |
| `bg-admin-page` | `bg-muted` | `--muted` = `--admin-neutral-bg` |
| `bg-admin-blue-bg` | `bg-secondary` | `--secondary` = `--admin-blue-bg` |
| `text-admin-blue-dark` | `text-secondary-foreground` | `--secondary-foreground` = `--admin-blue-dark` |
| `border-admin-neutral-100` | `border-border` (or bare `border`) | `--border` = `--admin-neutral-100` |
| `text-admin-neutral-800` | `text-foreground` | `--foreground` = `--admin-neutral-800` |
| `text-admin-neutral-500` | `text-muted-foreground` | `--muted-foreground` = `--admin-neutral-500` |
| `bg-admin-primary` | `bg-primary` | `--primary` = `--admin-primary` |
| `text-admin-primary` | `text-primary` | same |
| `text-admin-primary-dark` | `text-accent-foreground` | `--accent-foreground` = `--admin-primary-dark` |

**Needs a judgment call (no exact semantic):**
- `bg-admin-surface-alt` (#fafafb, the input/field gray) — `--muted` is #f4f4f6 (slightly darker). Options: (a) accept `bg-muted` if the 1-step difference is acceptable, or (b) add a dedicated semantic token `--field` / `--surface-alt` mapped to `--admin-surface-alt` and use `bg-field`. **Recommend (b)** because the input-field background is a real recurring semantic role. Decide before mass-replacing.
- `text-admin-neutral-400` / `-300` / `-600` / `-700` — mid-neutrals with no semantic role. Map the muted-text ones (`400`) to `text-muted-foreground` if visually OK; otherwise leave as palette. Per-use decision, not blind replace.

## Task 1 — Settle the two judgment-call tokens

- [ ] Decide `bg-admin-surface-alt`: add `--surface-alt` (or `--field`) semantic token in `:root` + `@theme inline` mapped to `--admin-surface-alt`, with a `.dark` value; OR fold into `bg-muted`. Implement the chosen one in `globals.css`.
- [ ] Decide the mid-neutral text shades policy (map vs keep). Write the rule into `docs/06` §0.1 so future code follows it.

## Task 2 — Migrate the value-equal classes in components

- [ ] Mechanically replace each row of the migration map across `src/components/**` and `src/pages/**`. Because they are value-equal, light-mode rendering must not change. Use `cn()`-friendly edits; do not touch logic.
- [ ] Leave the "keep raw" roles (status colors, admin radii, layout dims) as `admin-*`.
- [ ] Quick audit after: `rg -n "(bg|text|border|ring)-admin-(surface|page|blue-bg|blue-dark|neutral-100|neutral-500|neutral-800|primary)\b" src` should return only intentional exceptions.

## Task 3 — Dark mode

- [ ] Implement the chosen dark posture from Decisions. If (a): add `.dark` overrides for the kept admin-only roles (status `bg`/`text`/`dot`, `surface-alt`/`field`). If (b): add a short note in `docs/02`/`docs/06` that dark mode is not yet supported, and ensure the toggle (if any) is hidden/disabled.

## Task 4 — Verify visual parity (this hits the VRC)

- [ ] `npm run build` clean, `npm run test:run` green.
- [ ] **Browser-verify `/` (MainLayoutPage) at 1366px and 1920px** against the Visual Regression Contract in `docs/superpowers/plans/2026-06-13-main-layout-componentization.md` — surface, borders, header color, field backgrounds, table header must be unchanged. Screenshot both widths.
- [ ] Spot-check the employees example and one numbered layout for incidental shifts.

---

## Definition of Done

- No `--admin-*` removed; palette intact.
- Component class usage migrated to semantic tokens per the map; only the documented admin-only roles still reference `admin-*`.
- Dark posture decided and implemented (not left half-broken).
- `/` visually identical at 1366px and 1920px; build + tests green.
- `docs/06` §0.1 updated with the "consume semantic tokens; `admin-*` is palette-only except <listed roles>" rule.

## Suggested order

Task 1 (decide tokens) → Task 2 (mass migrate) → Task 3 (dark) → Task 4 (verify). High blast-radius restyle — must not run concurrently with other UI work on the same files.
