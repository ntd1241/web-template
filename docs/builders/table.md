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
| `actions` | no | inline JSX stub |
| `custom` | optional | inline JSX stub |

Common options include `headerClassName`, `cellClassName`, `size`, `visibility`, and `enableSorting`.

## Ownership

- The spec owns columns, order, sizes, and generated serializable config.
- Generated output is scaffold-and-own. Fill stubs in place.
- Never regenerate over customized output. Generate to a scratch path and reconcile manually.
- Never hand-write a generated-looking columns file or edit generated badge config directly.
