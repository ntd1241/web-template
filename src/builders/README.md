# `src/builders` — component scaffold builders (dev-only)

Build-time **codegen** that turns a small, zod-validated spec into the **UI skeleton** of a feature
(table columns, form/dialog fields, page shell), so coding agents write a spec instead of repetitive
TSX. See the plan: `docs/superpowers/plans/2026-06-19-component-scaffold-builders.md`.

**Dev-only.** Like `src/examples/*`, nothing here ships unless the app imports it (it doesn't). The
**pure generators** live under `src/builders/*` so they are type-checked by `tsc` and unit-tested by
vitest with zero config. File-writing CLIs (which use `node:fs` + `prettier`) live under `tools/`.

## Core rules (from the plan)

- **Model-first.** A table's columns and a form's fields are two *projections* of the same entity
  zod schema. Specs reference the model; builders project it. No duplicated enums.
- **Generated vs owned split.** Builders emit `*.generated.tsx` (overwrite any time, UI + stubs).
  The owned `*.tsx` container imports it and fills logic. Regen never touches owned files.
- **Builders never emit raw HTML.** Every field-kind maps to an existing `src/components/ui`
  primitive (table side: `data-grid-columns` column-factory).

## What exists

- `table/` — the **table builder**: spec → a `use<Entity>Columns()` hook built on the existing
  `@/components/ui/data-grid-columns` column-factory.
