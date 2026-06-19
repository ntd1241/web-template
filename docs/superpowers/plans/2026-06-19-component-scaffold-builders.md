# Component Scaffold Builders (model-first codegen) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox
> (`- [ ]`) syntax for tracking. Each phase ends at a **green checkpoint** (`npm run build` +
> `npm run test:run`) before the next starts.

**Goal:** Give coding agents a **build-time scaffold pipeline** so a new admin page is assembled by
running small, deterministic **builders** from a JSON-ish spec instead of hand-writing TSX. Builders
emit the **UI skeleton** (90% — layout shell, table columns, form/dialog fields) ready for an agent
to **wire logic** (data hooks, handler bodies). This raises the *consistency floor* (a schema cannot
express stray CSS) and lowers token cost (agent writes a small spec, codegen writes the bulk).

**Non-goal (explicit guard):** This is **NOT** a runtime UI engine (no JSON→React-tree at runtime,
unlike Formily/RJSF/amis). It is **NOT** a regenerate-over-owned-files system. Output is real,
reviewable, editable TSX committed to the repo — matching the `src/examples/*` "copy & adapt" ethos.

**Tech stack:** React 19, TS strict (**no `any`**), zod (spec validation), existing `src/components/ui`
primitives, the **already-landed** `data-grid-columns` column-factory, react-hook-form + `Form`.
Builders are plain Node scripts emitting strings → `prettier`. **No new runtime deps.**

---

## Core architecture decisions (lock before coding)

1. **Model-first. One zod schema is the single source of truth.**
   A page's table columns and its form/dialog fields are two **projections** of the *same* entity
   (`src/features/<domain>/model` + `schemas/`). Specs reference the model; builders project it.
   This kills column↔field drift (e.g. `status` enum mismatched between grid and dialog) and gives
   **form validation for free** from the same zod schema (per `docs/07` validation factory).

2. **Scaffold-and-own (not a living-generated split).** *(Revised 2026-06-19.)*
   The builder is a **one-shot scaffolder**, like `shadcn add` — it matches the repo's copy-&-adapt
   ethos (examples exist to be owned and diverge). It generates **one** file; from that moment the
   **agent owns it** and edits freely (add buttons, badges, inline cell logic). The builder **never
   auto-overrides** a file in place. We do **not** attempt programmatic merge into an edited file —
   that's the trap; ownership avoids it entirely.
   - **Keep the spec** (`*.table.spec.ts`) next to the output — it's the source of truth, the token
     ratio demo, and the anchor an agent uses to re-derive "what the builder produces" vs "what I added".
   - **Provenance banner** names the builder + spec path (**no version** — this is a template, there's
     no legacy business code to preserve; version archaeology is pure noise here). Cells that need
     JSX/handlers are emitted as **inline stubs** (`cell: () => null` + a `TODO(scaffold)` comment) the
     agent fills in place — *not* callback params (those would force a second file = a covert split).
   - **Refresh flow when the builder improves:** re-run the builder to a **scratch path** (never over
     the owned file); the agent reconciles by re-applying its (small, example-only) edits. No 3-way
     version diff needed because nothing precious is being preserved.

3. **Page manifest + slots, not hand-assembly.**
   A single `page.manifest.ts` (zod-validated) references the model and lists blocks (`table`,
   `dialog`, …) with their field projections and target **slot** in the layout. An **orchestrator**
   runs the builders in order *and mounts each block into its slot deterministically*. The agent does
   **not** eyeball assembly — it only fills logic.

4. **One shared field-kind registry feeds every builder.**
   `text | number | currency | percent | date | time | select | multiselect | combobox | password |
   tags | suggestion | table-select | switch | textarea | …` defined **once**. Table builder maps a
   kind → column renderer; form builder maps the same kind → input component. DRY "what kinds exist".
   Each kind points at an existing `src/components/ui` component — **builders never emit raw HTML.**

5. **Builder registry for discovery.** `tools/builders/registry.ts` lists each builder + its zod spec
   schema, so an agent "analyses the elements then runs the matching builder" via a real lookup, not
   guessed names.

6. **Green checkpoint per builder.** Emitted skeleton must `npm run build` clean immediately (stub
   handlers compile). Agent gets a green mark after every step → small debug blast radius.

7. **Snapshot tests on output.** One builder bug = systemic. Each builder has a snapshot test so a
   regression in emitted TSX fails loudly.

### What we are NOT doing
Runtime interpretation; regenerating over owned/wired files; a builder per micro-component (keep the
**core set** ≈ `docs/05` catalogue: layout, data-table, form-dialog, detail-panel, filter-bar);
changing the template `Input` `onChange(event)` contract; emitting raw `<input>/<table>/<button>`.

---

## Phase 0 — Input palette: assessed, mostly **not worth porting** (decided 2026-06-19)

The current palette already covers the common field-kinds: `text` (Input), `number` (numeric-input),
`date` (datefield/calendar), `select` (select), `combobox`, `multiselect` (multi-select), `search`
(search-input), `textarea`, `switch`, `checkbox`, `radio`. Audit of the remaining Vacom inputs vs
template patterns:

| Vacom input | Verdict | Reason |
|---|---|---|
| `password-input` | **Drop** | Admin CRUD rarely needs it; trivial to inline. |
| `suggestion-input` | **Don't port as-is** | Hand-rolls a listbox + keyboard-nav with `div onClick` — reinvents `command`/cmdk (template's canonical searchable pattern, used by `combobox`). Wrong `onChange(value)` contract + `SearchUtils` coupling; fragile blur timing. |
| `tags-input` | **Don't port as-is** | Only adds **known options** (exact-label match) → overlaps `multi-select`. No free-text tags. |
| `input-calendar` | **Drop** | Overlaps template `datefield` + `calendar`. |
| `time-picker` | **Defer** | Thin `type=time` wrapper; port only when a datetime field-kind needs it. |
| `table-select-input` | **Defer** | Niche multi-column picker; if needed, rebuild on `command`/`DataGrid`, not the Vacom popover+table. |
| `select-input`/`custom-select` | **Skip** | `select` + `combobox` already cover. |

**Real gap = a free-text `TagsInput`** (arbitrary values + optional suggestions). The example's
`src/examples/employees/components/employee-skills-field.tsx` is already a clean template-native
prototype of exactly this. When the `tags` field-kind is needed, **promote that into a shared
`src/components/ui/inputs/tags-input.tsx`** (generalized, optional suggestions via the existing
`command`/`Combobox`) — do **not** port the Vacom version.

**Decision (2026-06-19):** skip all wholesale ports for now; proceed to Phase 1. Build `TagsInput`
template-native if/when a builder field-kind requires it.

---

## Phase 1 — Field-kind registry + Table builder

The table builder is **codegen on top of the existing** `src/components/ui/data-grid-columns`
column-factory (already shipped) — it does **not** reinvent columns. **Pure generators live under
`src/builders/` (dev-only, like `src/examples`)** so they are type-checked by `tsc` and unit-tested by
vitest with zero config; the file-writing CLI lives under `tools/`.

- [x] `src/builders/table/field-kinds.ts` — seed of the shared registry (decision 4): kind →
  column-factory method + `needsRenderCallback`/`isAccessor`. (Form-side `input` mapping added later.)
- [x] `src/builders/table/column-spec.ts` — zod `columnSpecSchema` (discriminated union over `kind`) +
  `tableSpecSchema`; invalid spec throws before any TSX is emitted.
- [x] `src/builders/table/table-builder.ts` — `buildColumnsModule(spec)`: pure string generator →
  `*.columns.generated.tsx` returning a `use<Entity>Columns()` hook (`createColumnHelpers<TRow>()` in
  one `useMemo`). Imports tree-shaken to what's used; badge configs hoisted to consts; **scaffold-and-own
  banner** (no version) + `specPath` provenance; `actions`/`custom` cells emitted as **inline stubs**
  (`cell: () => null` + `TODO(scaffold)`) — no callback params, no covert container split.
- [x] `src/builders/table/table-builder.test.ts` — assertions + snapshot. Verified: prettier parses
  & formats the output into clean idiomatic TSX; 0 tsc errors in `src/builders`; suite green.
- [x] `tools/builders/cli/gen-table.ts` + `npm run gen:table -- <spec> <out>` (import spec module →
  `buildColumnsModule` → repo prettier config → write file). Verified generating the golden fixture.

**Verify:** generated file builds clean; snapshot test green. ✅ generator core + CLI done.

---

## Phase 2 — Form / Dialog builder

- [ ] `tools/builders/form-builder.ts` — input: field-spec list (projection of the model);
  output: `*.fields.generated.tsx` (RHF fields composed from `src/components/ui` per field-kind) +
  validation wired from the **model zod schema** + a `*.dialog.tsx` owned container (header/footer,
  scrollable body — mirror `create-employee-dialog.tsx`, submit stub).
- [ ] Field-kinds resolve through the Phase-0 input palette + the shared registry.
- [ ] `npm run gen:form <spec.json>` + snapshot test.

**Verify:** build clean; snapshot green; reproduces the create-employee dialog field set from a small
spec.

---

## Phase 3 — Layout builder + orchestrator + page manifest

- [ ] `tools/builders/layout-builder.ts` — emits the page shell (`header` title/description, named
  body **slots**), body empty.
- [ ] `tools/builders/page.manifest` zod schema + `tools/builders/orchestrator.ts` — reads a manifest,
  runs layout→table→form in order, **mounts each block into its slot** in the generated page.
- [ ] `tools/builders/registry.ts` — builder discovery table (decision 5).
- [ ] `npm run gen:page <manifest.json>`.

**Verify:** a manifest with `{ table, dialog }` produces a page that builds clean and renders both,
mounted, with only handler bodies left as stubs.

---

## Phase 4 — Golden fixture (synthetic) + render proof + pilot (materials)

Two distinct artifacts (don't conflate them):

1. **Golden fixture = builder regression anchor.** Commit the *pure* prettier-formatted generator
   output for the employees column spec at `src/builders/table/__fixtures__/employee.columns.generated.tsx`
   plus the spec. A test does `buildColumnsModule(spec) |> prettier === fixture` so any builder drift
   fails CI, and the fixture is readable + tsc-checked (it lives in `src`). This is the "mẫu chuẩn để
   so sánh" — it shows what good output looks like and locks it.
- [x] `src/builders/table/__fixtures__/employee.table.fixture.ts` (projection of a self-contained
  `Employee` type) + committed golden `employee.columns.generated.tsx`.
- [x] `src/builders/table/golden.test.ts` — regen → prettier → byte-match the committed fixture.

**Render proof (co-located).** `src/builders/table/__fixtures__/employee.columns.demo.test.tsx`
mounts the generated hook in a `DataGrid` with mock rows and asserts accessor + badge cells render —
closes the "typechecks but never renders" gap without an examples dependency.
- [x] Demo render test green.

2. **Pilot = scaffold-and-own on a real page (materials).** ✅ Done 2026-06-19. `/example/materials`
   (was a placeholder) now renders a real DataGrid scaffolded by the builder.
- [x] `src/examples/material/model/material.ts` + `data/materials.mock.ts`.
- [x] `src/examples/material/table/material.table.fixture.ts` spec → `npm run gen:table` →
  `components/material-columns.generated.tsx`. `group` badge column fully generated; owner filled the
  `qr` / `identity` (ảnh+tên+mã) / `tags` / `actions` inline cell stubs.
- [x] Wired into `materials-management-page.tsx`; browser-verified at 1366px and 1920px (no console
  errors, columns sized correctly, no truncation).

**Learnings:** (a) builder must **quote non-identifier badge keys** (`'kiem-ke'`) — fixed + tested.
(b) `DataGridTable` is `table-fixed` and distributes extra width equally, so dense grids need explicit
`size` per column (added to the spec) to avoid squished/truncated cells. (c) Custom-heavy grids
(qr/identity/tags) gen less than accessor-heavy ones — the win here is **consistent column
scaffolding**, not raw token count.

---

## Definition of Done

- All builders are plain Node + zod + prettier; **no runtime deps added**; output is committed TSX.
- `generated`/owned split honoured; regen never clobbers wired logic.
- Single model schema drives both table and form projections (no duplicated enums).
- `npm run build` exits 0; `npm run test:run` green; snapshot tests cover every builder.
- No `any`; named exports; `import type`; `cn()` for conditional classes; files < 400 lines.
- Pilot reproduces the employees page from a manifest with browser parity at 1366/1920.

## Suggested order
Phase 0 (inputs) → Phase 1 (registry + table builder) → Phase 2 (form builder) → Phase 3
(orchestrator) → Phase 4 (pilot). Phases 1–3 each depend on the prior.
