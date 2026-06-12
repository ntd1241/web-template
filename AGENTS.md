# Agent Instructions

This project is a Metronic 9 React starter template being adapted into a reusable web/admin template for the Vietnamese market. Before making product, UI, layout, permissions, or project-structure decisions, read these documents:

- `docs/01-coding-convention.md`
- `docs/02-design-system.md`
- `docs/03-permission-system-design.md`
- `docs/04-specific-design-system.md`

Treat those files as the desired direction, not as a perfect description of the current repository. They were written concept-first, before a full codebase pass, so the actual code always wins when there is a mismatch.

## Current Stack Facts

- Runtime: Vite, React 19, TypeScript, Tailwind CSS 4 via `@tailwindcss/vite`.
- Routing: React Router 7 packages are installed. Current routes are declared with `<Routes>` / `<Route>` in `src/routing/app-routing-setup.tsx`.
- App shell: `src/App.tsx` sets up `ThemeProvider`, `HelmetProvider`, `LoadingBarContainer`, `BrowserRouter`, `Toaster`, and `AppRouting`.
- Styling entrypoint: `src/styles/globals.css`, which imports Tailwind, `tw-animate-css`, Metronic config, and declares Tailwind 4 `@theme` tokens.
- Shared UI components live mostly as single files in `src/components/ui/*.tsx`.
- Metronic layout examples live in `src/components/layouts/layout-*` and `src/pages/layout-*`.
- The alias `@/*` maps to `src/*`.

## How To Use The Docs

Use `docs/04-specific-design-system.md` as the highest-priority UI reference when building AgriBase-like screens. It contains extracted tokens, shell structure, table patterns, modal details, and concrete HTML references from the target product.

Use `docs/02-design-system.md` as the general UX direction for Vietnamese admin apps: dense, operational, table-first, keyboard-friendly, low-ornament, and optimized for 1366px to 1920px desktop workflows.

Use `docs/01-coding-convention.md` for intended conventions when adding new business features, but adapt it to the current repo:

- Do not move existing Metronic files just to match the proposed `src/app`, `src/features`, or `src/constants` structure.
- When adding a new domain feature, prefer a feature-first folder such as `src/features/<domain>/...`.
- Reuse `src/components/ui` before creating new base components.
- Prefer named exports for new components to match the dominant current code style.
- Keep current Prettier formatting: semicolons, single quotes, trailing commas, 2 spaces.
- Use `@/` for cross-folder imports.

Use `docs/03-permission-system-design.md` when implementing auth, RBAC, permissions, route guards, menu filtering, or admin role screens. Frontend permission checks are only UX; backend permission and scope checks remain mandatory.

## Important Mismatches To Verify

- The coding convention document mentions React 18, React Router 6, Tailwind 3 config, Zustand 4, Axios, and `tailwind.config.ts`. The current project uses React 19, React Router 7 packages, Tailwind 4 `@theme`, and does not currently include Zustand or Axios.
- The proposed folder structure in `docs/01-coding-convention.md` is a target architecture. The current repository still uses Metronic's starter structure.
- `docs/02-design-system.md` specifies Ant Design-like blue tokens such as `#1677FF`, while the current CSS tokens are still mostly Metronic/shadcn zinc-based variables. When restyling, update tokens deliberately in `src/styles/globals.css` / `src/styles/config.metronic.css` instead of hardcoding colors in components.
- `docs/04-specific-design-system.md` supersedes the generic blue admin palette for AgriBase work. Its primary palette is green `#009966`, admin action blue `#1a69a1`, dark icon rail `#322e37`, and page background `#f4f4f6`.
- For AgriBase admin shells, use `src/components/layouts/layout-20` as the closest existing Metronic base because it already has a two-part sidebar: icon rail plus secondary menu.
- The docs describe future app-level concepts such as auth stores, API clients, route guards, feature pages, and permission constants. These should be introduced only when the relevant feature is implemented.

## UI Implementation Rules

- Preserve Metronic component behavior unless the task explicitly asks to replace it.
- Favor dense, desktop-admin layouts over marketing-style pages.
- Build actual working screens, not landing pages, when asked for an app/template feature.
- Tables should support sticky headers, fixed action columns, loading/empty states, pagination, and permission-aware actions when relevant.
- Forms should use Vietnamese validation copy, clear required markers, compact spacing, and predictable tab order.
- Prefer Lucide icons when a matching icon exists. Keep icon-only controls to familiar actions or provide accessible labels/tooltips.
- Do not create one-off button/input/table variants if an existing `src/components/ui` component can be extended cleanly.

## Verification

Before claiming work is complete, run the narrowest useful checks:

- `npm run build` for TypeScript and production build validation.
- `npm run lint` only when its auto-fix behavior is acceptable for the changed files.
- For UI changes, run the dev server and inspect the relevant page in a browser at desktop widths around 1366px and 1920px.
