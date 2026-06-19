# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Your Role: Reviewer / Supervisor, Not Primary Author

In this repository Claude acts as the **supervisor (người giám sát)**. Implementation work
is usually carried out by other coding agents (e.g. Codex) or by humans following an approved
plan. Your job is to:

1. Turn a request into (or validate) a written plan under `docs/superpowers/plans/` before code is written.
2. Make sure every change follows the rules in `docs/` and in this file.
3. Review diffs against the relevant plan and the conventions, and **block** anything that drifts.
4. Verify with the build and, for UI, with the browser at desktop widths before calling work done.

Default to reviewing and correcting rather than rewriting from scratch. Only author code directly
when the user explicitly asks you to implement, or when a fix is small and unambiguous.

## Read These Before Any Non-Trivial Change

Order matters. `docs/00` describes the actual stack/foundation; `AGENTS.md` covers how docs relate to code.

- `docs/00-stack-and-architecture.md` — **source of truth for stack, versions, and the app foundation.**
- `AGENTS.md` — how to interpret the docs vs the real code; current stack facts; UI rules.
- `docs/01-coding-convention.md` — intended structure, naming, TypeScript, React, Tailwind rules.
- `docs/02-design-system.md` — UX direction (dense, table-first Vietnamese admin).
- `docs/03-permission-system-design.md` — RBAC, route guards, menu filtering (when touching auth).
- `docs/04-specific-design-system.md` — external case study; reference only, never copy brand/domain names.
- `docs/05-example-pages-proposal.md` — the catalogue of example pages this template should grow.
- `docs/06-component-usage-guide.md` — **the canonical "use this component, not raw HTML" hub** (principles
  + lookup table + review checklist). Per-component detail lives in `docs/components/*.md`
  (`button`, `forms`, `display`, `data-grid`).
- `docs/07-lib-utilities.md` — usage of `src/lib/*` helpers (validation factory, format, date, search, errors).
- `docs/08-scaffold-builders.md` — **model-first codegen builders** (table builder now): how agents
  USE a builder (`npm run gen:table`, scaffold-and-own rules) and how to CREATE a new one. New data
  tables are scaffolded via the builder, not hand-written `ColumnDef[]`. Skill: `scaffold-table`.
- `docs/superpowers/plans/*.md` — active implementation plans; check for one before reviewing a change.

**The actual code always wins when a doc disagrees with it.** The convention doc in particular
describes a target architecture, not the current repo — see "Known Doc/Repo Mismatches" below.

## Commands

```bash
npm install --force      # deps need --force (React 19 peer ranges)
npm run dev              # Vite dev server → http://localhost:5173  (/ renders MainLayoutPage)
npm run build            # tsc (typecheck) && vite build — the authoritative gate, must exit 0
npm run test:run         # vitest run (one-shot) — use for verification/CI
npm run test             # vitest watch
npm run lint             # eslint src --fix  (auto-fixes; only run when auto-fix is acceptable)
npm run format           # prettier --write .
```

Verification = `npm run build` clean **and** `npm run test:run` green, plus browser inspection for UI
work. Husky pre-commit runs `lint-staged` (eslint --fix + prettier) on staged files.
`npm run dev -- --host 127.0.0.1` when a stable host is needed for screenshots.

## Architecture (the big picture)

Metronic 9 React starter being adapted into a reusable Vietnamese admin template. Vite + React 19 +
TypeScript + Tailwind 4 (`@tailwindcss/vite`, no `tailwind.config.*`). Alias `@/*` → `src/*`.

- **App shell:** `src/App.tsx` wires `ThemeProvider`, `HelmetProvider`, `LoadingBarContainer`,
  `BrowserRouter`, `Toaster`, `AppRouting`. Routes are plain `<Routes>/<Route>` in
  `src/routing/app-routing-setup.tsx` (React Router 7) — **not** the `createBrowserRouter` form the
  convention doc shows. Each `layout-N` route wraps its page with the matching `layout-N` shell.
- **The template surface is `main-layout`, not the `layout-1..39` demos.** `/` →
  `MainLayout` (`src/components/layouts/main-layout`) + `MainLayoutPage`
  (`src/pages/main-layout/page.tsx`). The numbered layouts/pages are Metronic reference examples;
  their styling may change as a side effect of restyling shared components, and that is acceptable.
- **Shared UI (`src/components/ui/*.tsx`)** is a shadcn/Metronic-style primitive layer driven by
  `class-variance-authority`. This is the **only** place base components (Button, Input, Card, Badge,
  Avatar, DataGrid, Table…) may be defined. Features must reuse these, not re-create them.
- **Design tokens** live in `src/styles/globals.css`: raw `--admin-*` custom properties, mapped via
  `@theme inline` to Tailwind classes (`bg-admin-surface`, `text-admin-blue-dark`,
  `rounded-admin-card`, `rounded-admin-control`, etc.). The admin palette is **green-primary**
  (`--admin-primary: #009966`), not the blue `#1677FF` the design-system doc still mentions. Restyle
  by editing tokens here, never by hardcoding hex in components.
- **Data tables:** the canonical pattern is TanStack `useReactTable` + `DataGrid` /
  `DataGridTable` / `DataGridPagination` (see `docs/06-component-usage-guide.md`). Reserve the
  primitive `Table` for small non-paginated lists only.

## Reviewing an Implementation (what to enforce)

When checking a change made by another agent or yourself, gate on:

- **Plan adherence.** If a plan in `docs/superpowers/plans/` covers the area, every change maps to a
  step in it. Out-of-scope edits (e.g. "Out Of Scope" items in the main-layout plan) are rejected.
- **No raw UI primitives in pages.** A management page must not contain `<button>`, `<input>`,
  `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>` for reusable concerns. Plain `div`/`span`
  layout wrappers are fine. Quick check:
  `rg -n "<button|<input|<table|<thead|<tbody|<tr|<td|<th" <file>`
- **Tokens over hex.** New code uses `admin-*` token classes, not `bg-[#...]`. Existing hardcoded
  hex in `main-layout` is being migrated — don't add more.
- **Style at the root, not per page.** The admin look is baked into shared-component defaults:
  `DataGrid`/`DataGridTable` (sticky header, `px-6` cells, uppercase `admin-blue-dark` header, row
  hover) and `Input`/`Textarea`/`Select` (gray `admin-surface-alt` field, white on focus). Reject PRs
  that re-create this via per-page `tableClassNames`/`className`/`bg-*` wrappers. To change the shared
  look, edit the component CVA (or a token in `globals.css`) — see `docs/06` §0.1. Per-page overrides
  are only for genuinely page-specific needs (e.g. a column `min-w`).
- **Conventions:** named exports for new components/pages; `handle*` handlers; `is/has/can` booleans;
  no `any` (use `unknown`); `import type` for types; `cn()` for conditional classes; one component
  per file; files under ~400 lines.
- **Visual parity for restyles.** When a change restyles shared component defaults to match
  `main-layout`, the visible result of `/` must not regress. The main-layout plan carries an explicit
  "Visual Regression Contract" — hold changes to it and confirm with screenshots at **1366px and 1920px**.
- **Vietnamese UI copy** for labels, placeholders, validation, empty/confirm states.

## Known Doc/Repo Mismatches (do not "fix" the code to match the doc)

Most stack mismatches have been **resolved** by the foundation setup — see `docs/00`. Remaining notes:

- Stack is **React 19 / Router 7 (declarative) / Tailwind 4 (`@theme`, no `tailwind.config.*`)**.
  Zustand, Axios, React Query (wired), react-intl, Vitest, Husky are now installed and configured.
  `docs/01` §9/§10/§16 carry banners pointing here; trust `docs/00` + `package.json` for versions.
- Prettier is **`semi: true`, `printWidth: 80`, `trailingComma: all`** with import sorting via
  `@ianvs/prettier-plugin-sort-imports`. Let `npm run format` decide — never strip semicolons.
- ESLint (`eslint.config.js`): `no-explicit-any` is **warn** (legacy Metronic uses `any`),
  `consistent-type-imports` is **error** (auto-fixed). New feature code should avoid `any` entirely.
- `src/features/` does not exist yet — create it per `docs/00` §4 for new domains. The numbered Metronic
  `layout-*` files keep their layout-first structure; never relocate them to match the proposed tree.
- `README.md`'s legacy "Supabase Auth / demo user" flow does not apply — the template is backend-agnostic,
  **mock-first** (`VITE_USE_MOCK=1`). Auth is abstracted via `src/stores/auth.store.ts` + `src/lib/axios.ts`.

## Examples vs Features

`src/examples/<domain>/` holds **dev-only reference features** (excluded from the production build via
DCE — see `src/examples/README.md`). Each example is a full **feature-first** module
(`model/ data/ schemas/ api/ hooks/ components/ pages/ index.ts`) that mirrors a real
`src/features/<domain>/` so devs copy it and adapt. `src/examples/employees/` is the canonical
data-table reference (DataGrid + React Query mock-first + debounced search + server pagination +
permission-gated action + loading/empty/error states).

When adding a new example: put it under `src/examples/<domain>/`, register its route **only** in
`src/examples/example-routes.tsx` (the single DEV-gated entry point), use **named** exports, compose
from `src/components/ui` (see `docs/06`), and include the standard states. Do not register example
routes directly in `app-routing-setup.tsx` — keep them isolated so the whole folder stays deletable.
Follow `docs/05-example-pages-proposal.md` for which pages to build.
