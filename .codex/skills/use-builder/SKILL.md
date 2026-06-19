---
name: use-builder
description: Use when implementing any generated or repeatable project UI surface in the web-template repo, including pages, feature screens, lists, grids, forms, dialogs, columns, filters, detail views, layout shells, or any area that may be covered by the scaffold builder registry.
---

# Use Builder

## Overview

This repo has scaffold builders for repeated admin surfaces. Before hand-writing any page or feature surface, check the builder registry and use a matching builder as a one-shot scaffolder.

## Workflow

1. Read `src/builders/README.md` first. Its registry is the source of truth for available builders, spec types, commands, and when each applies.
2. If the requested surface matches a registry row, read the relevant workflow in `docs/08-scaffold-builders.md`, then scaffold from the required spec.
3. Actually run the command listed by the registry or builder docs. Do not type a generated-looking file by hand.
4. Treat output as scaffold-and-own: generate once, then fill stubs, wire data, adjust page-specific logic, and verify. To refresh existing generated output, regenerate into a scratch path and reconcile manually.
5. If no builder fits, implement with `docs/06-component-usage-guide.md` and `src/components/ui` primitives. If the same surface will repeat, consider adding a new builder per `docs/08-scaffold-builders.md` Part 2.

## Hard Rules

- Do not hand-write what a matching builder owns.
- Do not edit builder-owned generated metadata, banners, registries, config blocks, or constants directly. Change the spec and regenerate.
- Do not regenerate over a file that already contains filled logic. Use a scratch output and reconcile.
- Do not create one skill per builder. This skill is the generic builder gate; the registry decides which builder to use.
- Do not patch shared admin styling per page when the change belongs in component defaults or tokens; follow `docs/06` section 0.1.

## Verification

After scaffolding, run the narrowest relevant checks:

- Run the builder-specific tests documented by `src/builders/README.md` or `docs/08-scaffold-builders.md` when touching builder code or generated consistency.
- `npm run build` before claiming the page or feature is complete.
- For UI pages, inspect the route in browser at desktop widths around 1366px and 1920px.
