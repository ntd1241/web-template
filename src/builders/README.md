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

| Builder        | Scaffolds                                                                                                 | Spec type                                     | Command                                    | Use when                                                | Guide                                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `table`        | `use<Entity>Columns()` hook (DataGrid columns, including commit-on-change `editableSelect` cells)         | `TableSpec` (`@/builders/table`)              | `npm run gen:table -- <spec> <out>`        | building any paginated/data table                       | [`docs/builders/table.md`](../../docs/builders/table.md)               |
| `editor-table` | `<Entity>EditorTable` RHF field-array table with editable cells, sticky action column, and viewport modes | `EditorTableSpec` (`@/builders/editor-table`) | `npm run gen:editor-table -- <spec> <out>` | building spreadsheet-like edit tables inside edit pages | [`src/builders/editor-table/README.md`](./editor-table/README.md)      |
| `form`         | `<Entity>Form`, `<Entity>FormDialog`, `use<Entity>Form()` (RHF + zodResolver, responsive 12-col grid)     | `FormSpec` (`@/builders/form`)                | `npm run gen:form -- <spec> <out>`         | building reusable create/edit forms and dialog wrappers | [`docs/builders/form-dialog.md`](../../docs/builders/form-dialog.md)   |
| `tree`         | `<Entity>Tree` and optional `<Entity>TreePanel` with count badges and callback-only actions               | `TreeSpec` (`@/builders/tree`)                | `npm run gen:tree -- <spec> <out>`         | building hierarchical navigation/filter trees           | [`docs/builders/tree.md`](../../docs/builders/tree.md)                 |
| `account-menu` | Dropdown menu content with groups, items, badges, switches, values, and radio submenus                    | `AccountMenuSpec` (`@/builders/account-menu`) | `npm run gen:account-menu -- <spec> <out>` | building reusable account/user menus                    | [`docs/builders/account-menu.md`](../../docs/builders/account-menu.md) |

| `layout` | `<Component>` wrapper with navigation/content slots, width presets, height modes, and resize config | `LayoutSpec` (`@/builders/layout`) | `npm run gen:layout -- <spec> <out>` | building reusable two-area content layouts | [`docs/builders/layout.md`](../../docs/builders/layout.md) |
| `detail` | Entity detail shell with profile/information slots and generated line tabs | `DetailSpec` (`@/builders/detail`) | `npm run gen:detail -- <spec> <out>` | building reusable entity detail pages | [`docs/builders/detail.md`](../../docs/builders/detail.md) |
| `detail-dialog` | Local-data entity detail dialog with generated tabs, search, and fuzzy-search callbacks | `DetailDialogSpec` (`@/builders/detail-dialog`) | `npm run gen:detail-dialog -- <spec> <out>` | building reusable multi-tab detail dialogs | [`docs/builders/detail-dialog.md`](../../docs/builders/detail-dialog.md) |
| `chart` | Recharts chart component with series, axes, legend, tooltip, and optional point callbacks | `ChartSpec` (`@/builders/chart`) | `npm run gen:chart -- <spec> <out>` | building repeatable chart variants | [`docs/builders/chart.md`](../../docs/builders/chart.md) |
| `tooltip` | Chart tooltip wrapper and optional shared style provider | `TooltipSpec` (`@/builders/tooltip`) | `npm run gen:tooltip -- <spec> <out>` | standardizing tooltip presentation across charts | [`docs/builders/tooltip.md`](../../docs/builders/tooltip.md) |
| `segmented-control` | Single-selection segmented control wrapper using `ToggleGroup` | `SegmentedControlSpec` (`@/builders/segmented-control`) | `npm run gen:segmented-control -- <spec> <out>` | repeated view or mode switchers with connected options | [`docs/builders/segmented-control.md`](../../docs/builders/segmented-control.md) |
| `filter` | Search/select filter toolbar wrappers with typed callbacks and renderer slots | `FilterSpec` (`@/builders/filter`) | `npm run gen:filter -- <spec> <out>` | repeated server-side list filter toolbars | [`docs/builders/filter.md`](../../docs/builders/filter.md) |
| `column-filter` | Compact text, searchable select, multi-select, number-range, and date-range controls for data-grid header filters | `ColumnFilterSpec` (`@/builders/column-filter`) | `npm run gen:column-filter -- <spec> <out>` | repeated filters rendered beneath table column labels | [`docs/builders/column-filter.md`](../../docs/builders/column-filter.md) |

_(Future builders — page/orchestrator — add a row here. A programmatic `tools/builders/registry.ts`
arrives with the Phase 3 orchestrator; this table is the agent-facing index until then.)_

## Shared lower-level builders

[`src/builders/shared/form-field-builder.ts`](./shared/form-field-builder.ts) is the lower-level
form-control builder used by `form` and `editor-table`. It maps normalized field kinds to the existing
UI primitives (`Input`, `DatePickerInput`, `OptionSelect`, and so on), while higher-level builders
provide binding expressions and surface-specific attributes. Data-driven single-select fields use
`OptionSelect`; the low-level `Select` remains for compound/custom compositions such as `inputSelect`.
It is intentionally not a CLI generator: it is a composition primitive so generated outputs remain
scaffold-and-own files.

The matching control-level Zod schemas live in
[`src/builders/shared/form-field-spec.ts`](./shared/form-field-spec.ts). Higher-level specs extend
those schemas with their own layout and behavior fields, so additions such as date/number `format`
validated and typed from one source.

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
