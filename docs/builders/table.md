# Table Builder

Use the table builder for paginated or data-table columns. The registry and command source of truth is
[`src/builders/README.md`](../../src/builders/README.md).

## Workflow

1. Ensure the row type exists in the feature model.
2. Create `<domain>/table/<entity>.table.fixture.ts` exporting a `TableSpec` from
   `@/builders/table`. Set `specPath` to the fixture path.
3. Generate the columns:

   ```bash
   npm run gen:table -- <spec.ts> <out.tsx>
   ```

4. Keep the provenance banner. Fill `actions` and `custom` `cell: () => null` stubs in the generated
   file using `src/components/ui`.
5. Define explicit `size` values for dense fixed-layout tables.
6. Wire `use<Entity>Columns()` into the feature's existing `useReactTable` and `DataGrid` setup.
7. Run builder tests when builder/spec consistency changes, focused feature tests, and `npm run build`.

## Column Kinds

| Kind | Field | Output |
| --- | --- | --- |
| `index` | no | 1-based row number |
| `select` | no | row checkbox |
| `text` | yes | string cell |
| `number` | yes | Vietnamese number formatting |
| `currency` | yes | VND formatting |
| `percent` | yes | percentage formatting |
| `date` | yes | date, datetime, or relative formatting |
| `badge` | yes | generated `StatusBadge` config |
| `editableSelect` | yes | compact Select cell, bound to the row value and committed on change |
| `actions` | no | inline JSX stub |
| `custom` | optional | inline JSX stub |

Common options include `headerClassName`, `cellClassName`, `size`, `visibility`, and `enableSorting`.

### `editableSelect`

Use `editableSelect` for Phase 1 inline editing: one cell commits immediately when the user chooses a new
value. The builder can serialize static option lists, but the write handler belongs to the page, so any
table with at least one `editableSelect` column generates a params-bearing hook.

```ts
{
  kind: 'editableSelect',
  id: 'statusSelect',
  header: 'Đổi trạng thái',
  field: 'status',
  placeholder: 'Chọn trạng thái',
  options: [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'locked', label: 'Đã khóa' },
  ],
}
```

Generated shape:

```tsx
export interface UseEmployeeColumnsParams {
  onStatusSelectEdit: (row: Employee, value: string) => void;
}

export function useEmployeeColumns(
  params: UseEmployeeColumnsParams,
): ColumnDef<Employee>[] {
  // ...
}
```

`optionsFrom` defaults to `'static'`, which requires `options` in the spec and emits
`const <id>Options = [...]`. Set `optionsFrom: 'prop'` when the page must supply options at runtime; the
hook params then also include `<id>Options: { value: string; label: string }[]`.

Wire commits in the page through the existing mutation layer, for example:

```tsx
const updateStatus = useUpdateEmployeeStatusMutation();
const columns = useEmployeeColumns({
  onStatusSelectEdit: (row, status) => {
    updateStatus.mutate({ id: row.id, status });
  },
});
```

For bulk edits over selected rows, compose the `DataGridActionBar` primitive
(`@/components/ui/data-grid-action-bar`) inside `<DataGrid>`: it reads the table from context, floats
while rows are selected, and hosts page-owned bulk controls (e.g. a status `Select` + Áp dụng). See
`src/examples/employees/pages/employees-page.tsx`. Do not model bulk editing with `editableSelect`.

## Ownership

- The spec owns columns, order, sizes, and generated serializable config.
- Generated output is scaffold-and-own. Fill stubs in place.
- Never regenerate over customized output. Generate to a scratch path and reconcile manually.
- Never hand-write a generated-looking columns file or edit generated badge config directly.
