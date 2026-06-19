---
name: use-builder
description: Use before implementing any page, feature screen, table, form, dialog, filter, detail view, layout shell, or other repeatable UI surface that may match the project builder registry.
---

# Use Builder

This is the generic builder gate for all current and future scaffold builders.

## Workflow

1. Read `docs/workflows/implement-ui.md` and inspect the relevant feature code.
2. Read the registry in `src/builders/README.md`.
3. For every matching surface, open only the guide linked by its registry row, write the required spec,
   and run the documented `npm run gen:*` command.
4. Own the generated output: fill stubs, wire feature logic, and verify behavior.
5. If no builder matches, compose `src/components/ui` per `docs/06-component-usage-guide.md`. Consider
   `docs/builders/authoring.md` only when the surface is genuinely repeatable.

## Rules

- Never hand-write output owned by a matching builder or fake generated provenance.
- Specs own generated structure and serializable config. Change the spec, then regenerate.
- Never overwrite customized output. Generate to a scratch path and reconcile manually.
- Do not create one skill per builder; the registry routes all builders.
- Shared styling belongs in component defaults or tokens, not page patches.

## Verification

- Run focused behavior and builder-consistency tests as applicable.
- Run `npm run build` before completion.
- Use browser preview only for unresolved visual or interaction risk.
