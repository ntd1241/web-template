# Task-Oriented Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize project documentation into small task-routed guides so builder-driven UI work loads only the builder workflow and relevant feature code.

**Architecture:** `docs/README.md` becomes the routing hub, while each active document has one canonical responsibility. Builder usage, component APIs, permissions, references, and historical engineering records live in separate directories and are loaded only when a task needs them.

**Tech Stack:** Markdown, PowerShell link auditing, Git.

---

### Task 1: Finalize the documentation map and UI workflow

**Files:**
- Create: `docs/README.md`
- Create: `docs/workflows/implement-ui.md`
- Modify: `docs/engineering/specs/2026-06-19-task-oriented-documentation-design.md`

- [ ] **Step 1: Update the approved spec for neutral engineering paths**

Replace every `docs/superpowers` or `superpowers/` path in the target structure and routing rules with
`docs/engineering` or `engineering/`. Add `workflows/implement-ui.md` to the target tree and state that
it is the canonical end-to-end UI delivery workflow while `use-builder` remains the activation gate.

- [ ] **Step 2: Create the task router**

Create `docs/README.md` with these exact routing categories:

```markdown
# Documentation Router

Start from the task, not from the document number. Read only the listed files and current code.

| Task | Required reading | Conditional reading |
|---|---|---|
| Implement a UI page or surface | `workflows/implement-ui.md`, `src/builders/README.md` | Matching `builders/*`; matching `components/*` only for customization |
| Add or edit a form dialog | `workflows/implement-ui.md`, `builders/form-dialog.md` | `components/forms.md`, `07-lib-utilities.md` |
| Add or edit a data table | `workflows/implement-ui.md`, `builders/table.md` | `components/data-grid.md` |
| Add a feature or wire API state | `00-stack-and-architecture.md` | Relevant sections of `01-coding-convention.md` |
| Change shared styling or UX rules | `02-design-system.md`, `06-component-usage-guide.md` | Matching `components/*` |
| Implement permissions | `permissions/overview.md` | One of `frontend.md`, `backend.md`, `admin-ui.md` |
| Create or extend a builder | `builders/authoring.md` | Existing builder source and tests |

`reference/` and `engineering/` are opt-in. Do not read them for ordinary implementation tasks.
```

- [ ] **Step 3: Create the canonical UI implementation workflow**

Create `docs/workflows/implement-ui.md` with concise phases:

1. Translate the request into visible behavior and create/edit states.
2. Inspect the existing feature model, schema, hooks, API, page, and tests.
3. Read `src/builders/README.md`, select every matching builder, then read only its guide.
4. Run the generator, own the output, and fill generated stubs.
5. Wire query/mutation state, dialog state, defaults, invalidation, toast, and permission behavior only when required.
6. Add focused tests for open, validation, submit, success, failure, and edit defaults as applicable.
7. Run targeted tests and `npm run build`; use browser preview only for unresolved visual or interaction risk.

Include a dedicated create/edit dialog checklist and a "Do not load by default" list covering global
design, permission, reference, and historical engineering docs.

- [ ] **Step 4: Verify the new map is internally consistent**

Run:

```powershell
rg -n "superpowers|docs/04|docs/05|docs/08" docs/README.md docs/workflows docs/engineering/specs/2026-06-19-task-oriented-documentation-design.md
```

Expected: no stale `superpowers`, numbered deleted-doc, or combined-builder references.

- [ ] **Step 5: Commit the router and workflow**

```bash
git add docs/README.md docs/workflows/implement-ui.md docs/engineering/specs/2026-06-19-task-oriented-documentation-design.md
git commit -m "docs: add task-oriented routing"
```

### Task 2: Split builder documentation by use case

**Files:**
- Create: `docs/builders/table.md`
- Create: `docs/builders/form-dialog.md`
- Create: `docs/builders/authoring.md`
- Delete: `docs/08-scaffold-builders.md`
- Modify: `src/builders/README.md`
- Modify: `.codex/skills/use-builder/SKILL.md`
- Modify: `.claude/skills/use-builder/SKILL.md`

- [ ] **Step 1: Extract the table workflow**

Move only the table mental model, command, seven usage steps, column-kind table, refresh rule, and
targeted verification into `docs/builders/table.md`. Link to the live table builder source instead of
repeating generator implementation details.

- [ ] **Step 2: Extract the form-dialog workflow**

Move only the form schema/spec command, create/edit ownership rules, field-kind table, width presets,
submit wiring, and focused verification into `docs/builders/form-dialog.md`. Add explicit create/edit
requirements: reset values when opening, avoid submit duplication, invalidate affected queries, retain
the dialog on mutation failure, and close only after success.

- [ ] **Step 3: Extract builder authoring rules**

Move builder layout, pure-generator rules, CLI placement, unit/golden/render-proof tests, and registry
update requirements into `docs/builders/authoring.md`. This file is never required when merely using a
builder.

- [ ] **Step 4: Update registry and skill links**

Change `src/builders/README.md` registry rows so each builder links directly to its guide. Remove stale
"form/dialog + page shell next" wording. Make both `use-builder` skills point to the matching
`docs/builders/<name>.md` and `docs/workflows/implement-ui.md`; retain one generic skill rather than
creating a second skill.

- [ ] **Step 5: Remove the combined builder guide and verify stale links**

Run:

```powershell
rg -n "08-scaffold-builders|docs/08|form/dialog \+ page shell next" AGENTS.md CLAUDE.md .codex .claude docs src/builders/README.md
```

Expected: no active references. Matches inside `docs/engineering/plans/` are historical and may remain.

- [ ] **Step 6: Commit builder documentation**

```bash
git add docs/builders docs/08-scaffold-builders.md src/builders/README.md .codex/skills/use-builder/SKILL.md .claude/skills/use-builder/SKILL.md
git commit -m "docs: split builder workflows"
```

### Task 3: Compact active architecture, convention, design, and component hubs

**Files:**
- Modify: `docs/00-stack-and-architecture.md`
- Modify: `docs/01-coding-convention.md`
- Modify: `docs/02-design-system.md`
- Delete: `docs/04-specific-design-system.md`
- Modify: `docs/06-component-usage-guide.md`
- Modify: `docs/07-lib-utilities.md`
- Rename: `docs/reference/05-example-pages-proposal.md` to `docs/reference/example-page-catalog.md`

- [ ] **Step 1: Compact architecture to current facts**

Keep only current stack boundaries, app foundation pointers, data-flow rules, feature wiring order, and
commands in `00`. Replace duplicated folder trees and tutorials with links to current directories and
the UI workflow.

- [ ] **Step 2: Rewrite coding conventions as enforceable rules**

Replace the long tutorial in `01` with short sections for feature structure, naming, TypeScript,
components and handlers, state/data fetching, forms, imports, error handling, tests, and formatting.
Remove version inventories, full config examples, Git/PR templates, and long component implementations.

- [ ] **Step 3: Rewrite the design system around shared decisions**

Keep UX principles, density, semantic token ownership, layout behavior, accessibility, Vietnamese copy,
and interaction defaults in `02`. Remove component API examples now owned by `docs/components/*` and
builder workflows owned by `docs/builders/*`.

- [ ] **Step 4: Compact component and utility hubs**

Keep `06` as a lookup table and shared-component ownership rules. Keep `07` as a utility index with
links to live source. Remove duplicated examples already present in component guides or source tests.

- [ ] **Step 5: Remove obsolete case study and rename optional catalogue**

Delete `04-specific-design-system.md`. Rename the moved reference file to
`docs/reference/example-page-catalog.md`, update its title to "Example Page Catalog", and mark it as
optional planning reference, not implementation guidance.

- [ ] **Step 6: Measure active-doc reduction**

Run:

```powershell
Get-ChildItem docs -File -Filter *.md | Select-Object Name,Length
```

Expected: `01` and `02` are materially smaller; no root active doc exceeds roughly 20 KB without a
single-domain reason.

- [ ] **Step 7: Commit core documentation**

```bash
git add docs/00-stack-and-architecture.md docs/01-coding-convention.md docs/02-design-system.md docs/04-specific-design-system.md docs/06-component-usage-guide.md docs/07-lib-utilities.md docs/reference
git commit -m "docs: compact active project guides"
```

### Task 4: Split permission documentation by concern

**Files:**
- Create: `docs/permissions/overview.md`
- Create: `docs/permissions/frontend.md`
- Create: `docs/permissions/backend.md`
- Create: `docs/permissions/admin-ui.md`
- Delete: `docs/03-permission-system-design.md`

- [ ] **Step 1: Create permission overview**

Move terminology, permission naming, effective-scope rules, security boundary, and routing links into
`overview.md`. State that frontend permission checks are UX only and backend enforcement is mandatory.

- [ ] **Step 2: Create focused implementation guides**

Move auth store, hooks, route protection, component-level checks, and navigation filtering to
`frontend.md`; JWT, permission guard, scope query behavior, and refresh rules to `backend.md`; role,
module, and assignment screen guidance to `admin-ui.md`. Remove repeated explanations from each file.

- [ ] **Step 3: Remove the combined permission document**

Delete `docs/03-permission-system-design.md` after all active routing points to
`docs/permissions/overview.md`.

- [ ] **Step 4: Commit permission documentation**

```bash
git add docs/03-permission-system-design.md docs/permissions
git commit -m "docs: split permission guidance"
```

### Task 5: Update active routing and verify the migration

**Files:**
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: active Markdown files containing stale links

- [ ] **Step 1: Update only path routing in agent files**

Point UI work to `docs/workflows/implement-ui.md`, builder work to `docs/builders/*`, and permissions to
`docs/permissions/overview.md`. Keep the existing selective-reading policy; do not reintroduce a list
that says to read all docs.

- [ ] **Step 2: Audit active Markdown links**

Run a PowerShell link audit over `AGENTS.md`, `CLAUDE.md`, `.codex/skills`, `.claude/skills`, root
active docs, `docs/builders`, `docs/components`, `docs/permissions`, `docs/workflows`, and
`src/builders/README.md`. Ignore external URLs, heading fragments, and historical files under
`docs/engineering`.

Expected: every relative Markdown target exists.

- [ ] **Step 3: Audit stale active references**

Run:

```powershell
rg -n "docs/0[3458]|specific-design-system|example-pages-proposal|docs/superpowers" AGENTS.md CLAUDE.md .codex .claude docs/README.md docs/builders docs/components docs/permissions docs/workflows src/builders/README.md
```

Expected: no matches.

- [ ] **Step 4: Measure the form-dialog reading path**

Sum character counts for `.codex/skills/use-builder/SKILL.md`, `src/builders/README.md`,
`docs/workflows/implement-ui.md`, and `docs/builders/form-dialog.md`; estimate tokens as `ceil(chars/4)`.

Expected: the full default path remains near 1,500-2,500 tokens and excludes architecture, design,
permission, reference, and engineering history.

- [ ] **Step 5: Review the final diff**

Run:

```powershell
git diff --check
git status --short
git diff --stat
```

Expected: no whitespace errors; only intended documentation, skill-link, registry, and agent-routing
changes remain.

- [ ] **Step 6: Commit final routing fixes**

```bash
git add AGENTS.md CLAUDE.md .codex/skills/use-builder/SKILL.md .claude/skills/use-builder/SKILL.md docs src/builders/README.md
git commit -m "docs: verify task-routed documentation"
```
