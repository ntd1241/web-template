# Editor Table Builder

Use `editor-table` for spreadsheet-like edit tables inside edit/detail pages:
order lines, invoice lines, inventory count rows, and similar
react-hook-form field arrays.

This builder is not a page layout builder. The page owns the header, toolbar
actions, surrounding cards, submit mutation, totals, and any general-information
forms above the table.

## Workflow

1. Ensure the row type and RHF values type exist.
2. Create `<domain>/table/<entity>.editor-table.fixture.ts` exporting an
   `EditorTableSpec` from `@/builders/editor-table`.
3. Generate the component:

   ```bash
   npm run gen:editor-table -- <spec.ts> <out.tsx>
   ```

4. Keep the provenance banner. Fill computed cell stubs, then wire the generated
   component into the page/card layout.
5. Run focused feature tests and `npm run build`.

## Viewport Modes

- `fixed`: best for editable tables. The table keeps a usable height even when
  the page has cards above it. Presets:
  - `sm`: `clamp(320px, 42dvh, 480px)`
  - `md`: `clamp(400px, 52dvh, 600px)`
  - `lg`: `clamp(480px, 62dvh, 760px)`
- `remaining`: best for pages where the table is the primary content and should
  fill the remaining viewport while keeping a usable minimum editing height.
- `natural`: lets the page scroll naturally. Use only for short tables or
  read-mostly detail sections.

For the current order edit pilot, prefer `remaining`.

## Supported Columns

| Kind               | Output                                                  |
| ------------------ | ------------------------------------------------------- |
| `index`            | 1-based row number                                      |
| `text`             | compact text/email/tel/url input cell                   |
| `number`           | compact numeric input cell                              |
| `date`             | compact date input cell                                 |
| `computedCurrency` | read-only VND cell stub for page-owned row calculations |

The builder emits default row actions: duplicate, insert below, and delete. The
action column is pinned to the right so it remains visible during horizontal
scroll.

## Multi Edit

Set `multiEdit.enabled` and mark safe editable columns with `bulkEdit: true` to
emit row selection plus a floating bulk action bar. When `headerInputs` is true,
bulk-enabled headers also show compact inputs under the label; both action bar
and header inputs apply only to selected rows.

## Example Spec

```ts
import type { EditorTableSpec } from '@/builders/editor-table';

const spec: EditorTableSpec = {
  entity: 'OrderItem',
  componentName: 'OrderItemsEditorTable',
  modelImport: '../model/order',
  valuesType: 'OrderItemsFormValues',
  valuesImport: '../form/order-items.schema',
  arrayName: 'items',
  tableMinWidthClass: 'min-w-[1760px]',
  viewport: { mode: 'remaining' },
  multiEdit: { enabled: true, headerInputs: true },
  columns: [
    { kind: 'index', header: 'STT', widthClass: 'w-14' },
    { kind: 'text', name: 'sku', header: 'Mã hàng', widthClass: 'w-36' },
    {
      kind: 'text',
      name: 'name',
      header: 'Tên hàng hóa',
      widthClass: 'min-w-56',
    },
    {
      kind: 'number',
      name: 'quantity',
      header: 'Số lượng',
      min: 0,
      widthClass: 'w-32',
    },
    {
      kind: 'number',
      name: 'unitPrice',
      header: 'Đơn giá',
      min: 0,
      widthClass: 'w-40',
    },
    {
      kind: 'number',
      name: 'taxRate',
      header: 'VAT %',
      min: 0,
      widthClass: 'w-28',
      bulkEdit: true,
    },
    {
      kind: 'computedCurrency',
      id: 'lineTotal',
      header: 'Thành tiền',
      widthClass: 'w-40',
    },
  ],
};

export default spec;
```

## Ownership

- The spec owns columns, order, table min width, and viewport mode.
- Generated output is scaffold-and-own. Fill computed stubs in place.
- Re-generate customized files only to a scratch path, then reconcile manually.
- Do not use this builder for paginated list tables; use the `table` builder and
  `DataGridTable`.
