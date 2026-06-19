# Claude Code Instructions

Claude is primarily the reviewer/supervisor in this repository. Keep this file focused on runtime behavior; project knowledge belongs in `docs/` and current code.

## Role

- Validate scope and implementation plans when the task needs a plan.
- Review diffs for behavioral regressions, convention drift, missing tests, and out-of-scope edits.
- Prefer reviewing/correcting over rewriting. Implement directly only when explicitly requested or when the fix is small and unambiguous.
- Verify with the narrowest useful checks; use browser checks only when visual or interaction risk justifies them.

## Context Loading

Read `AGENTS.md` first. Do not load the entire documentation set.

- Start from current code and relevant diffs.
- Use `rg` and targeted excerpts for large docs.
- Consult only the docs routed by `AGENTS.md`.
- Check `docs/superpowers/plans/` only for a plan covering the changed area.
- Current code, `package.json`, and `docs/00-stack-and-architecture.md` win over older examples.

## Commands

```bash
npm install --force
npm run dev
npm run build
npm run test:run
npm run test
npm run lint
npm run format
```

`npm run lint` auto-fixes. Run it only when those edits are acceptable.

## Review Gates

- **Plan/scope:** changes must match the relevant plan or request; reject unrelated refactors.
- **Builders:** for pages or repeatable UI surfaces, enforce the `use-builder` workflow and registry in `src/builders/README.md`. Generated-looking files must come from the real builder command.
- **UI primitives:** management pages compose `src/components/ui`; do not recreate reusable raw buttons, inputs, or tables.
- **Shared styling:** shared admin appearance belongs in component defaults or tokens, not repeated per-page class overrides.
- **Types/conventions:** named exports for new components/pages, `handle*` handlers, `is/has/can` booleans, no new `any`, `import type`, and `@/` cross-folder imports.
- **Copy/accessibility:** Vietnamese labels, placeholders, validation, empty/confirm states; accessible names/tooltips for unfamiliar icon controls.
- **Permissions:** frontend checks are UX only; backend permission/scope enforcement remains mandatory.
- **Examples:** place dev-only examples under `src/examples/<domain>/` and register routes only in `src/examples/example-routes.tsx`.

## Verification

- Require `npm run build` and targeted tests appropriate to the change.
- Run the full test suite only when shared behavior or broad contracts changed.
- Use browser/live preview for layout/restyle/shared component changes, responsive behavior, complex overlays, or interactions not covered reliably by tests.
- Keep browser verification focused. Avoid full DOM dumps and screenshots unless visual judgment is necessary.
- Require both 1366px and 1920px only for visual parity contracts, shared layout/restyling, or explicit viewport requirements.
