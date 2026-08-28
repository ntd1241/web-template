# Filter Builder

Use the filter builder for repeated list filter toolbars. It scaffolds a typed wrapper around the
shared `FilterToolbar` component.

## Ownership

- The spec owns filter order, labels, placeholders, static options, and control sizing.
- The generated wrapper owns only UI composition and typed value callbacks.
- Feature hooks own `useTableListState`, filter value types, badge renderers, query params, API calls,
  and mutations.
- The builder does not know backend/RPC parameter names.

Select fields are rendered by the shared `FilterToolbar`, which uses the canonical `OptionSelect`
with `searchable={false}` for compact toolbar filters. Clicking the active option again clears the
filter; the builder does not add a separate clear button or an implicit “all” option.

## Spec

```ts
import type { FilterSpec } from '@/builders/filter';

const spec: FilterSpec = {
  componentName: 'ContractFilterBar',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm theo mã hoặc tên',
      className: 'w-72',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Trạng thái',
      options: [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'active', label: 'Đang hiệu lực' },
      ],
      className: 'w-44',
    },
  ],
};

export default spec;
```

Run:

```bash
npm run gen:filter -- <spec.ts> <out.tsx>
```

For domain-specific badges, pass `statusRenderOption` and `statusRenderValue` from the feature. Do
not put a backend mapper or business rule in the generated file.
