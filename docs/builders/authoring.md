# Builder Authoring

Read this only when creating or extending a scaffold builder. Ordinary UI implementation uses the
matching guide in this directory.

## Required Layout

```text
src/builders/<name>/
  <thing>-spec.ts
  field-kinds.ts
  <name>-builder.ts
  <name>-builder.test.ts
  golden.test.ts
  generated-consistency.test.ts
  index.ts
  __fixtures__/
  __snapshots__/
tools/builders/cli/gen-<name>.ts
```

Add `gen:<name>` to `package.json` and a registry row to [`src/builders/README.md`](../../src/builders/README.md).

## Generator Contract

- Keep the generator pure, synchronous, zod-validated, and free of file-system access.
- Put file writing and Prettier integration in `tools/builders/cli`.
- Preserve entity types, named exports, `import type`, and tree-shaken imports; emit no `any`.
- Map kinds to existing `src/components/ui` primitives. Do not emit raw reusable HTML controls.
- Emit inline stubs only for JSX or handlers that cannot be represented in the spec.
- Emit a provenance banner naming `specPath`; do not add builder versions.
- Hoist generated serializable config and quote non-identifier keys.
- Extend shared field-kind concepts instead of forking equivalent registries.

## Required Tests

1. Unit tests cover every spec branch and invalid input.
2. Snapshot or focused output assertions describe generated structure.
3. Golden tests regenerate, format, and byte-compare committed output.
4. Generated-consistency tests protect builder-owned banners and config.
5. Render-proof tests mount generated output and assert useful behavior.

Run the narrow builder test files first, then `npm run test:run` and `npm run build` when builder source
changes.

## Boundaries

- No runtime UI engine or automatic merge into customized output.
- No new runtime dependency for build-time scaffolding.
- No builder for a one-off micro-component. Add a builder only for a repeated, spec-shaped surface.
