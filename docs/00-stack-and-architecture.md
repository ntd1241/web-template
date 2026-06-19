# Stack And Architecture

Read this for feature boundaries, data flow, or setup decisions. For UI-only work, start from
[`docs/README.md`](./README.md) instead. Current code and `package.json` win over this document.

## Current Stack

| Concern | Choice | Source |
| --- | --- | --- |
| Build | Vite | `vite.config.ts` |
| UI | React 19, TypeScript strict | `src/`, `tsconfig.app.json` |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` | `src/styles/globals.css` |
| Routing | React Router declarative routes | `src/routing/app-routing-setup.tsx` |
| Server state | TanStack React Query | `src/lib/query-client.ts` |
| Client state | Zustand | `src/stores/` |
| HTTP | Axios | `src/lib/axios.ts` |
| Forms | react-hook-form and zod | feature schemas, `src/components/ui/form.tsx` |
| i18n | react-intl, Vietnamese default | `src/i18n/` |
| Testing | Vitest and Testing Library | `vitest.config.ts`, `src/test/` |

Exact versions belong in `package.json`, not duplicated here.

## Application Boundaries

- `src/providers/`: app-wide providers and startup composition.
- `src/config/`: validated environment access.
- `src/lib/`: shared clients and domain-neutral utilities.
- `src/constants/`: route and query-key contracts.
- `src/stores/`: genuinely global client state such as auth and shell UI.
- `src/components/ui/`: shared UI primitives and component defaults.
- `src/components/layouts/`: Metronic and app-shell layouts.
- `src/features/<domain>/`: production domain features.
- `src/examples/<domain>/`: dev-only reference features, excluded from production.
- `src/builders/`: build-time UI scaffold generators; see [`src/builders/README.md`](../src/builders/README.md).

Do not relocate existing Metronic layout modules merely to match feature-first structure.

## Data Flow

```text
Page or feature component
  -> feature hook
  -> React Query query/mutation
  -> feature API module
  -> mock response or Axios client
  -> backend
```

- Components do not call Axios directly.
- Server state stays in React Query, not Zustand.
- Feature-local UI state stays local.
- Global stores contain only cross-feature client state.
- API errors are normalized at the client boundary and surfaced through query/mutation state.

## Add Or Extend A Feature

Inspect the existing feature first; create only the layers the task needs. The usual order is:

1. Model and DTO types.
2. Zod schema and inferred values.
3. API functions with existing mock/real behavior.
4. Query and mutation hooks with stable query keys.
5. Feature hooks for filters, pagination, or orchestration.
6. UI generated and composed through [`workflows/implement-ui.md`](./workflows/implement-ui.md).
7. Thin page composition and route registration.
8. Focused tests for changed behavior.

Page states such as loading, empty, error, and permissions are added when the feature contract requires
them. Do not load permission docs for features without permission behavior.

## Commands

```bash
npm run dev
npm run build
npm run test
npm run test:run
npm run lint
npm run format
```

`npm run lint` and `npm run format` write files. Use them only when those edits are intended.

## Environment

Declare Vite environment types in `src/vite-env.d.ts`, access them through `src/config/env.ts`, and keep
local secrets in `.env.local`. `.env.example` documents supported variables.
