# Agent Instructions

This project is a Metronic 9 React starter template being adapted into a reusable Vietnamese web/admin template. Keep this file as runtime policy, not project history.

## Token Budget / Doc Loading Policy

Do not read every project document by default. Start from current code and this file, then read only the narrowest relevant docs or sections. Prefer `rg` and targeted excerpts over full-file reads for large docs.

Doc routing:

- `docs/00-stack-and-architecture.md` — stack, versions, app foundation. Consult when architecture or setup is unclear.
- `docs/06-component-usage-guide.md` — UI primitive/component usage. Read relevant component sections before UI implementation.
- `src/builders/README.md` + `docs/08-scaffold-builders.md` — scaffold builder registry and workflows. Read when a page/surface may be generated.
- `docs/01-coding-convention.md` — targeted sections for naming, feature structure, TypeScript, forms, routing, or imports.
- `docs/02-design-system.md` — targeted sections for dense Vietnamese admin UX, tables, forms, dialogs, copy, and interaction behavior.
- `docs/03-permission-system-design.md` — only for auth, RBAC, permissions, route guards, menu filtering, or admin role screens.
- `docs/04-specific-design-system.md` — only for visual parity, restyling, layout work, or concrete Vietnamese admin reference patterns.

Current code, `package.json`, and `docs/00` win over older doc examples.

## Stack Snapshot

- Vite, React 19, TypeScript, React Router 7 declarative routes, Tailwind CSS 4 via `@tailwindcss/vite`.
- Alias `@/*` maps to `src/*`.
- Shared UI primitives live in `src/components/ui`.
- Existing Metronic `layout-*` files keep their layout-first structure; do not relocate them just to match docs.
- New domain work should be feature-first (`src/features/<domain>/...`) unless working inside `src/examples/`.

## UI Implementation Rules

- Before implementing any page, feature screen, repeated UI surface, or generated scaffold candidate, always use the project skill `use-builder` at `.codex/skills/use-builder`. Read `src/builders/README.md` first; the registry decides whether a builder exists and which command/spec workflow to use.
- Preserve Metronic component behavior unless the task explicitly asks to replace it.
- Favor dense, desktop-admin layouts over marketing-style pages.
- Build actual working screens, not landing pages, when asked for an app/template feature.
- Tables should support sticky headers, fixed action columns, loading/empty states, pagination, and permission-aware actions when relevant.
- Forms should use Vietnamese validation copy, clear required markers, compact spacing, and predictable tab order.
- Prefer Lucide icons when a matching icon exists. Keep icon-only controls to familiar actions or provide accessible labels/tooltips.
- Reuse `src/components/ui` before creating new base components.
- Style shared admin defaults at the component/token root, not with per-page class patches. See `docs/06` section 0.1 when changing shared look.

## Verification

Before claiming work is complete, run the narrowest useful checks:

- `npm run build` for TypeScript and production build validation.
- Targeted tests for changed behavior; broader `npm run test:run` only when the blast radius justifies it.
- `npm run lint` only when its auto-fix behavior is acceptable for the changed files.
- For UI changes, prefer automated tests and focused DOM/assertion checks first.
- Run browser/live preview only when visual layout, responsive behavior, shared styling, modals/popovers, or user-facing interaction cannot be trusted from tests alone.
- Browser checks should be narrow: open the route, perform the relevant interaction, inspect console/errors, and avoid full DOM dumps or screenshots unless visual judgment is required.
- Check both 1366px and 1920px only for layout/restyle/shared component changes or when the task explicitly requires viewport parity.
