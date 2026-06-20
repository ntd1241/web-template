# `src/builders` — component scaffold builders (dev-only)

Build-time **codegen** that turns a small, zod-validated spec into the **UI skeleton** of a feature, so
coding agents write a spec instead of repetitive TSX. Start from the registry below, then read only the
matching guide. Historical plan: [`docs/engineering/plans/2026-06-19-component-scaffold-builders.md`](../../docs/engineering/plans/2026-06-19-component-scaffold-builders.md).

**Dev-only.** Like `src/examples/*`, nothing here ships unless the app imports it (it doesn't). The
**pure generators** live under `src/builders/*` so they are type-checked by `tsc` and unit-tested by
vitest with zero config. File-writing CLIs (which use `node:fs` + `prettier`) live under `tools/`.

## Builder registry (start here — pick the right builder)

Before hand-writing a table/form/list-page surface, check this table. If a builder fits, **use it**
(scaffold-and-own) instead of writing the components by hand. If none fits, hand-build per `docs/06`
and consider whether a new builder is warranted (`docs/builders/authoring.md`).

| Builder | Scaffolds                                                                                             | Spec type                        | Command                             | Use when                                                | Guide                                                                |
| ------- | ----------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| `table` | `use<Entity>Columns()` hook (DataGrid columns, including commit-on-change `editableSelect` cells)      | `TableSpec` (`@/builders/table`) | `npm run gen:table -- <spec> <out>` | building any paginated/data table                       | [`docs/builders/table.md`](../../docs/builders/table.md)             |
| `form`  | `<Entity>Form`, `<Entity>FormDialog`, `use<Entity>Form()` (RHF + zodResolver, responsive 12-col grid) | `FormSpec` (`@/builders/form`)   | `npm run gen:form -- <spec> <out>`  | building reusable create/edit forms and dialog wrappers | [`docs/builders/form-dialog.md`](../../docs/builders/form-dialog.md) |

_(Future builders — page/orchestrator — add a row here. A programmatic `tools/builders/registry.ts`
arrives with the Phase 3 orchestrator; this table is the agent-facing index until then.)_

## Core rules

- **Model-first.** A table's columns and a form's fields are _projections_ of the same entity type.
  Specs reference the model; builders project it. No duplicated enums; validation from one zod schema.
- **Scaffold-and-own.** A builder is a one-shot scaffolder (like `shadcn add`): it generates a file
  **once**, then you **own** it — edit freely, fill the inline `cell: () => null` stubs in place. The
  builder **never** auto-overrides or merges back. To refresh: re-gen to a **scratch path** and
  reconcile by hand. Keep the spec next to the output.
- **Builders never emit raw HTML.** Every kind maps to an existing `src/components/ui` primitive
  (table side: the `data-grid-columns` column-factory).

## How to add a builder

See [`docs/builders/authoring.md`](../../docs/builders/authoring.md), then add a row to the registry above.
