# Detail builder

The detail builder scaffolds an entity detail page wrapper around the shared
`EntityDetailLayout` components. It owns the tab structure and exposes React
node slots for the entity profile, information card, and each tab's content.

## Spec

```ts
import type { DetailSpec } from '@/builders/detail';

const spec = {
  componentName: 'CustomerDetailLayout',
  tabs: [
    { value: 'contracts', label: 'Hợp đồng', icon: 'FileText' },
    { value: 'employees', label: 'Nhân viên', icon: 'Users' },
  ],
} satisfies DetailSpec;
```

Each tab generates a required React node prop named `<value>Content` by
default. Set `contentProp` when a tab needs a different prop name. The first
tab is active by default; `defaultTab` can select another declared tab.

Generate with:

```sh
npm run gen:detail -- src/project/customers/detail/customer-detail-layout.fixture.ts src/project/customers/components/customer-detail-layout.generated.tsx
```

The generated wrapper receives `profile`, `information`, and tab content slots.
It does not own API calls, mutations, permissions, or data mapping.

## Runtime components

Use the shared components directly when a generated wrapper is unnecessary:

- `EntityDetailLayout`: responsive profile/information/tabs page shell.
- `EntityDetailProfileCard`: avatar, title, subtitle, and profile metadata card.
- `EntityDetailInformationCard`: flexible information card with status and bottom actions.
- `EntityDetailInformationGrid`: shared field grid; it uses two columns from `sm` and four columns
  at `xl` so information cards align with four-column stat rows.
- `EntityDetailTabs`: line-style tabs with icon and content slots.

When composing the `information` slot, put detail fields inside `EntityDetailInformationGrid`
instead of defining a page-specific grid class. This keeps generated detail pages consistent.
