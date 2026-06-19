# Implement UI Workflow

Use this workflow for pages, dialogs, tables, filters, detail views, and other feature UI. It coordinates
delivery; builder-specific syntax belongs in `docs/builders/*`.

## 1. Define Behavior

- Turn the request into visible states and user actions.
- Identify create, edit, view, loading, empty, error, and permission behavior that actually applies.
- Reuse the current page and feature patterns before introducing structure.

## 2. Inspect The Feature

Read only the relevant model, schema, API/query hooks, page, nearby tests, and existing generated files.
Do not open global project docs unless the task exposes an architectural or design decision.

## 3. Select Builders

1. Read the registry in [`src/builders/README.md`](../../src/builders/README.md).
2. Select every builder matching the requested surfaces.
3. Read only the matching guide under [`docs/builders/`](../builders/).
4. Run the documented generator. Never hand-write output that a matching builder owns.

Generated output is scaffold-and-own: fill its stubs and adapt feature logic. Regenerate customized
files only to a scratch path, then reconcile manually.

## 4. Wire Behavior

- Keep server state in React Query and UI state local unless it is genuinely cross-feature.
- Connect loading, success, failure, toast, invalidation, and retry behavior to existing feature hooks.
- Add permission behavior only when the request or existing feature contract requires it.
- Reuse `src/components/ui` and `src/lib`; do not recreate base controls or shared utilities.

## Create/Edit Dialog Checklist

- [ ] The page owns `open`, selected entity, and create/edit mode.
- [ ] Opening create resets clean defaults; opening edit resets mapped entity values.
- [ ] Closing clears stale selection without racing the exit transition.
- [ ] Validation comes from the feature zod schema and uses Vietnamese messages.
- [ ] Submit is disabled or guarded while the mutation is pending.
- [ ] Success invalidates affected queries, shows feedback, then closes the dialog.
- [ ] Failure keeps the dialog and entered values open and shows normalized feedback.
- [ ] Tests cover opening, validation, submit payload, success, failure, and edit defaults when relevant.

## 5. Verify

1. Run focused tests for changed behavior.
2. Run `npm run build` before completion.
3. Use browser preview only when layout, responsive behavior, overlays, or user interaction cannot be
   trusted from tests. Keep the check to the affected route and interaction.
4. Check 1366px and 1920px only for layout, shared styling, or explicit viewport requirements.

## Do Not Load By Default

- Global design guidance for ordinary builder output.
- Permission docs when the feature has no permission behavior.
- `docs/reference/` product-planning material.
- `docs/engineering/` historical specs and plans.
