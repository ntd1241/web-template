# Coding Conventions

Read only the section relevant to the current task. Stack and architecture belong in
[`00-stack-and-architecture.md`](./00-stack-and-architecture.md); UI delivery belongs in
[`workflows/implement-ui.md`](./workflows/implement-ui.md).

## Feature Structure

- New production domains use `src/features/<domain>/`; examples use `src/examples/<domain>/`.
- Keep model, schema, API/query hooks, components, pages, and tests inside the owning domain.
- Reuse `src/components/ui` and `src/lib` before adding shared foundations.
- Keep pages thin: compose feature hooks and components rather than embedding domain infrastructure.
- Do not move existing `layout-*` modules solely for consistency with new features.

## Naming

| Item | Convention | Example |
| --- | --- | --- |
| Component/page | PascalCase named export | `MaterialFormDialog` |
| Hook | `use` + PascalCase | `useMaterialList` |
| Handler | `handle` + action | `handleCreateMaterial` |
| Boolean | `is`, `has`, `can`, `should` | `isSubmitting` |
| Type/interface | PascalCase | `MaterialFormValues` |
| Constants | uppercase for true constants | `MATERIAL_QUERY_KEYS` |
| Files/folders | existing domain convention; otherwise kebab-case | `material-form-dialog.tsx` |

Prefer domain language over generic names such as `data`, `item`, or `handleClick` when a precise name
is available.

## TypeScript

- Keep strict mode clean; do not introduce `any`.
- Use `unknown` at external boundaries and narrow it.
- Use `import type` for type-only imports.
- Derive form values from zod schemas and avoid duplicate interfaces.
- Prefer unions for finite UI states; use enums only when runtime enum behavior is required.
- Avoid non-null assertions unless an invariant is both established and local.

## React Components

- Use function components and named exports for new project components.
- Keep render logic declarative and event logic in `handle*` functions.
- Do not mirror props or query data into state without a synchronization requirement.
- Memoize only when profiling or referential contracts justify it.
- Extract a component when it gains an independent responsibility, not merely to reduce line count.
- Use accessible names for icon-only controls.

## State And Data Fetching

- Local interaction state stays in the component or feature hook.
- Server data and mutations use React Query.
- Cross-feature client state uses Zustand sparingly.
- API calls live in feature API modules and use the shared Axios client.
- Query keys come from the project's query-key helpers and remain stable.
- Mutations explicitly handle invalidation, success feedback, and normalized failures.

## Forms

- Use react-hook-form with a feature zod schema and `zodResolver`.
- Validation text, labels, placeholders, and feedback default to Vietnamese.
- Required fields show a clear marker and preserve predictable tab order.
- Create and edit modes reset from explicit values when opened.
- Pending submit cannot run twice; failed submit preserves entered values.
- Use the form builder when its registry row matches. See [`builders/form-dialog.md`](./builders/form-dialog.md).

## Imports And Exports

- Use `@/` for cross-folder imports and relative paths inside a close module.
- Keep type-only imports explicit.
- Prefer direct component imports established by the project over broad new barrels.
- Do not create circular feature dependencies; move genuinely shared contracts to a neutral owner.

## Styling

- Use Tailwind 4 utilities and semantic tokens defined in `src/styles/globals.css`.
- Do not add a Tailwind 3 config or hardcode palette values in feature UI.
- Shared appearance belongs in component defaults or tokens, not repeated page overrides.
- Use `cn()` for conditional classes.
- Follow [`02-design-system.md`](./02-design-system.md) only when making a shared UX or visual decision.

## Errors And Accessibility

- Normalize unknown API failures through `src/lib/errors`.
- Queries expose loading, error, retry, and empty behavior as applicable.
- Mutations keep recoverable UI open on failure.
- Form controls have labels or accessible names; errors are associated with their controls.
- Keyboard focus remains visible and dialogs return focus predictably.

## Tests And Verification

- Co-locate `*.test.ts(x)` with the behavior under test.
- Test observable behavior rather than implementation details.
- Prefer focused tests while iterating; run broader tests when shared contracts change.
- Run `npm run build` before completion.
- Use browser checks only for visual or interaction risk not covered by tests.

## Formatting

Prettier owns formatting: semicolons, single quotes, trailing commas, and 2-space indentation. ESLint and
Prettier can modify files, so run them only when repository-wide or changed-file edits are intended.
