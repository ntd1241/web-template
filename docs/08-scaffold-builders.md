# 08 — Scaffold Builders (model-first codegen)

Build-time **codegen** that turns a small zod-validated spec into the **UI skeleton** of a feature
(table columns now; form/dialog + page shell next). An agent writes a compact spec; the builder writes
the repetitive TSX. This raises the consistency floor (a schema can't express stray CSS) and cuts
tokens on accessor-heavy surfaces.

Source plan: [`docs/superpowers/plans/2026-06-19-component-scaffold-builders.md`](superpowers/plans/2026-06-19-component-scaffold-builders.md).
Code: `src/builders/*` (pure generators, dev-only) + `tools/builders/*` (CLIs).

## Mental model — **scaffold-and-own** (read this first)

The builder is a **one-shot scaffolder**, like `shadcn add`. It is **NOT** a runtime engine and **NOT**
a living-generated/owned file split.

1. **Model-first.** A table's columns and a form's fields are projections of **one** entity type
   (`src/features|examples/<domain>/model`). The spec references the model; the builder projects it.
   No duplicated enums; form validation comes from the same zod schema.
2. **Generate once, then you own it.** After `gen:*`, the file is yours — edit freely (fill cell
   stubs, add buttons/badges). The builder **never auto-overrides** and **never merges back**.
3. **Inline stubs, not callbacks.** Cells needing JSX (`actions`/`custom`) are emitted as
   `cell: () => null` + a `TODO(scaffold)` comment. Fill them **in place**.
4. **Keep the spec.** It's the source of truth + the anchor for refreshes. A provenance banner names
   the spec (no version — this template keeps no legacy).
5. **Refresh = regen to a scratch path**, then reconcile your edits by hand. Never regen over a file
   you've customized.
6. **Builders never emit raw HTML** — every kind maps to a `src/components/ui` primitive (tables go
   through the `data-grid-columns` column-factory).

---

## Part 1 — Using the table builder (agent workflow)

Use it whenever you build a paginated/data table (the `DataGrid` + `useReactTable` pattern in
`docs/06`). Do **not** hand-write `ColumnDef[]` arrays anymore.

### Steps

1. **Model** — ensure the row type exists (`model/<entity>.ts`). Enum-ish fields (status, group)
   become `badge` columns.
2. **Spec** — write `<domain>/table/<entity>.table.fixture.ts`, `export default` a `TableSpec`
   (`import type { TableSpec } from '@/builders/table'`). Set `specPath` for the banner.
3. **Generate**
   ```bash
   npm run gen:table -- <spec.ts> <out.tsx>
   # e.g. src/examples/material/table/material.table.fixture.ts \
   #      src/examples/material/components/material-columns.generated.tsx
   ```
   It validates the spec (fails loud), runs the generator, and formats with the repo prettier config.
4. **Fill stubs** — open the generated file (you own it now). Replace each `cell: () => null` for
   `qr`/`identity`/`actions`/`custom` columns with real JSX (compose `src/components/ui`). Accessor +
   `badge` columns are already done.
5. **Set `size` for dense grids** — `DataGridTable` is `table-fixed` and distributes spare width
   **equally**, so a 6-column grid squishes/truncates unless you give columns an explicit `size`
   (px). Put `size` in the spec **and** the generated file so a future regen keeps it.
6. **Wire** — `useReactTable({ data, columns: use<Entity>Columns(), getCoreRowModel, ... })` inside
   `DataGrid` (mirror `src/examples/material/pages/materials-management-page.tsx`).
7. **Verify** — `npm run test:run` green; browser-check at 1366px & 1920px (no truncation, no console
   errors).

### Column kinds (`kind` in the spec)

| kind | needs `field` | renders | notes |
|---|---|---|---|
| `index` | — | 1-based STT | optional `id`/`header` |
| `select` | — | row checkbox | — |
| `text` | ✅ | string cell | `tooltipOnTruncate?` |
| `number` | ✅ | `formatNumber` | `minimumFractionDigits?`/`maximumFractionDigits?` |
| `currency` | ✅ | `formatCurrencyVND` | right-aligned |
| `percent` | ✅ | `formatPercent` | `fractionDigits?` |
| `date` | ✅ | date util | `mode?: date \| datetime \| relative` |
| `badge` | ✅ | `StatusBadge` | `config: { <value>: { label, variant?, className?, dotClassName? } }` — fully generated |
| `actions` | — | **stub** `() => null` | fill inline (buttons/links) |
| `custom` | (optional) | **stub** `() => null` | fill inline (composite cells) |

Common per-column opts: `headerClassName`, `cellClassName`, `size`, `visibility`, `enableSorting`.

### Rules

- One spec = one entity. Hyphenated badge values (`'kiem-ke'`) are fine — the builder quotes keys.
- To change columns/order/sizes: **edit the spec**, not the table ad hoc (keeps spec↔file in sync).
- The generated file's banner stays; it documents provenance and that the file is owned.

---

## Part 2 — Creating a new builder

Follow the table builder as the template. Keep generators **pure** (string + zod, synchronous) so
they are tsc-checked and unit-tested with zero config; put file-writing CLIs under `tools/`.

### Layout

```
src/builders/<name>/
  <thing>-spec.ts        # zod schema(s) + inferred TS types; the spec contract
  field-kinds.ts         # registry: kind → primitive/factory it maps to (shared, extend don't fork)
  <name>-builder.ts      # pure `build<Thing>Module(spec): string` — validates, returns TSX source
  <name>-builder.test.ts # unit assertions + snapshot
  golden.test.ts         # regen → prettier → byte-match the committed golden
  index.ts               # barrel
  __fixtures__/
    <entity>.ts                       # self-contained type so the golden typechecks
    <entity>.<thing>.fixture.ts       # the example spec (NOT *.spec.ts — vitest collects those)
    <entity>.<thing>.generated.tsx    # committed golden (CLI output)
    <entity>.<thing>.demo.test.tsx    # render-proof: mount the output, assert it renders
tools/builders/cli/gen-<name>.ts      # CLI: import spec → build → prettier → mkdir -p → write
```

Wire `"gen:<name>": "tsx tools/builders/cli/gen-<name>.ts"` in `package.json`.

### Generator rules

- **No `any`**; the entity type flows through; named exports; `import type`.
- Validate the spec with zod first (`schema.parse`) — fail before emitting.
- **Tree-shake imports** — only emit what the spec uses.
- Emit **inline stubs** for cells/fields needing JSX/handlers (`() => null` + `TODO(scaffold)`),
  never callback params (that forces a covert second file).
- Provenance banner with `specPath`, scaffold-and-own wording, **no version**.
- Hoist serializable config (e.g. badge config) to consts; quote non-identifier object keys.
- Emit reasonable code; the **CLI** runs prettier (repo config) — don't hand-match prettier output.

### Tests required (all co-located)

1. **Unit** — each spec branch produces the right call; invalid spec throws.
2. **Golden** — committed `*.generated.tsx` is byte-reproducible (`build... → prettier === file`).
   Resolve the fixture path via `process.cwd()` (vitest `import.meta.url` is not a `file:` URL).
3. **Render proof** — mount the generated output and assert it renders (closes the typecheck-only gap).

### Do not

- No runtime UI engine; no programmatic merge into owned files; no regen over customized files.
- No new runtime deps; builders are Node + zod + prettier only.
- No builder per micro-component — keep the core set (`docs/05`): table, form/dialog, layout, etc.
- Don't fork `field-kinds` per builder — extend the shared registry so one source drives all.
