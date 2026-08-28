# Column Filter Builder

Use `column-filter` for compact controls rendered in a data-grid header through the column
`headerFilter` slot. It is separate from the `filter` builder because header filters have different
spacing, sizing, and responsive constraints than toolbar filters.

## Supported fields

- `search`
- `selectSearch`
- `multiSelect`
- `numberRange`
- `dateRange`

The generated component owns only control composition and typed value callbacks. Feature code owns
option mapping, badges, entity identity renderers, query state, and backend parameter mapping.

```ts
import type { ColumnFilterSpec } from '@/builders/column-filter';

const spec: ColumnFilterSpec = {
  componentName: 'Contract',
  fields: [
    { type: 'search', name: 'text', placeholder: '', ariaLabel: 'Tìm hợp đồng' },
    { type: 'selectSearch', name: 'customer', searchPlaceholder: 'Tìm khách hàng...' },
    { type: 'multiSelect', name: 'status', maxChips: 0 },
    { type: 'numberRange', name: 'outstanding', label: 'Còn phải thu', placeholder: '' },
    { type: 'dateRange', name: 'nextDue', label: 'Hạn gần nhất', placeholder: '' },
  ],
};
```

Run:

```bash
npm run gen:column-filter -- <spec.ts> <out.tsx>
```

Entity-specific option conversion and renderer slots stay outside the generated file. For example,
the contract feature can convert a customer record to `SelectOption` and pass a customer identity
renderer into the generated `OptionSelect`. `selectSearch` is retained as the builder field name for
backward compatibility; it emits `OptionSelect` with `searchable` enabled.
