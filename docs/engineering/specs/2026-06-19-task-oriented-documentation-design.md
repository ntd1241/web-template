# Task-Oriented Documentation Design

## Goal

Reorganize project documentation so an agent reads only the material required for the current task.
The primary optimization target is builder-driven UI work such as adding a create/edit form dialog to
an existing management screen, then wiring its feature logic.

## Principles

- Each rule or workflow has one canonical owner.
- Hub documents route readers; they do not repeat detailed guidance.
- Task guides are small and independently readable.
- Reference material and historical plans are excluded from default agent reading paths.
- Current code, `package.json`, and builder registries remain the source of truth for implemented behavior.
- Existing useful guidance is retained unless it is obsolete, duplicated, or superseded by current code.

## Target Structure

```text
docs/
  README.md                         # task-to-document router
  00-stack-and-architecture.md      # concise current architecture and data flow
  01-coding-convention.md           # enforceable coding rules only
  02-design-system.md               # shared UX principles and design tokens only
  06-component-usage-guide.md       # component documentation router
  07-lib-utilities.md               # utility documentation router
  workflows/
    implement-ui.md                 # end-to-end UI delivery workflow
  builders/
    table.md                        # using the table builder
    form-dialog.md                  # using the form/dialog builder
    authoring.md                    # creating or extending builders
  components/
    button.md
    data-grid.md
    display.md
    forms.md
  permissions/
    overview.md
    frontend.md
    backend.md
    admin-ui.md
  reference/
    example-page-catalog.md
  engineering/
    plans/                           # historical implementation plans
    specs/                           # approved designs
```

The obsolete external design-system case study will be deleted because its relevant styling has
already been integrated into the active system. The example-page proposal will become
`docs/reference/example-page-catalog.md` and remain optional product-planning reference.

## Content Ownership

### Documentation Router

`docs/README.md` maps common tasks to the smallest required reading set. It explicitly marks
`reference/` and `engineering/` as opt-in material.

### Architecture And Conventions

`docs/00-stack-and-architecture.md` owns current stack, app boundaries, data flow, and feature wiring.
`docs/01-coding-convention.md` owns short enforceable rules for naming, TypeScript, imports, handlers,
feature structure, forms, and tests. It will not repeat stack inventories, tool configuration, or long
tutorial implementations.

### Design And Components

`docs/02-design-system.md` owns cross-component UX principles, density, semantic tokens, interaction,
accessibility, and Vietnamese admin conventions. Component APIs and concrete composition examples
belong only in `docs/components/*`. `docs/06-component-usage-guide.md` remains a compact lookup hub.

### Builders

`src/builders/README.md` remains the canonical builder registry. Builder usage moves from the combined
legacy guide into one guide per builder. Builder implementation rules move to
`docs/builders/authoring.md`. The combined guide is removed after all inbound links are updated.

`docs/workflows/implement-ui.md` owns the end-to-end UI delivery sequence. The `use-builder` skill
remains a small activation gate and routes agents to this workflow plus the matching builder guide;
the project does not add a second UI implementation skill.

### Permissions

Permission documentation is isolated by concern. General feature work does not read it. Permission
tasks start with `permissions/overview.md`, then load only frontend, backend, or admin UI guidance as
needed.

## Builder-Driven UI Reading Path

For a task such as "add create/edit material dialog and wire its logic", the default path is:

1. Read `.codex/skills/use-builder/SKILL.md`.
2. Read the registry in `src/builders/README.md`.
3. Read `docs/builders/form-dialog.md`.
4. Inspect the existing material model, schema, hooks, API, page, and the generated fixture relevant to
   the form builder.
5. Read a specific component guide only when the generated scaffold needs an unsupported or customized
   control.

The agent does not load architecture, global design, permission, reference, or historical-plan docs
unless the requested behavior actually depends on them. The target documentation budget for this path
is approximately 1,500-2,500 tokens before reading feature code.

## Migration Rules

- Update links in active docs, builder registries, project skills, and agent routing files.
- Do not preserve redirects for deleted numbered docs unless an external consumer is known.
- Remove stale statements such as builders described as "next" after they already exist.
- Prefer links to exact files and headings rather than instructions to read an entire documentation set.
- Keep Vietnamese for project guidance; retain English identifiers and commands exactly.
- Do not rewrite historical plans merely to match the new structure.

## Verification

- Search for links to deleted or renamed docs and fix active references.
- Validate every Markdown link under active docs, skills, `AGENTS.md`, `CLAUDE.md`, and
  `src/builders/README.md`.
- Compare document sizes and estimated reading cost before and after migration.
- Walk through the material form-dialog task and record the exact files required.
- Run `npm run build` only if documentation changes touch code or generated artifacts; otherwise use
  documentation-specific checks.

## Success Criteria

- No active document duplicates a detailed builder workflow or component API.
- No active document instructs agents to read all major docs before implementation.
- The form-dialog workflow is complete without reading unrelated design, permissions, or reference docs.
- Reference and historical material remain available but are never in a default task route.
- All active cross-references resolve after the migration.
