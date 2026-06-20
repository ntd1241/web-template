import type { EditorTableSpec } from '../editor-table-spec';

/**
 * Minimal spec: no `computedCurrency` column and `actions` disabled. Guards the
 * conditional imports — the generated file must NOT import `formatCurrencyVND`,
 * `Copy`/`Trash2`, or use `insert`/`remove`, otherwise `noUnusedLocals` breaks
 * the build. Co-located generated file is type-checked by `npm run build`.
 */
const spec: EditorTableSpec = {
  entity: 'LeanRow',
  componentName: 'LeanRowEditorTable',
  modelImport: './lean-row',
  valuesType: 'LeanRowsFormValues',
  valuesImport: './lean-row',
  arrayName: 'rows',
  specPath:
    'src/builders/editor-table/__fixtures__/lean-row.editor-table.fixture.ts',
  tableMinWidthClass: 'min-w-[640px]',
  viewport: { mode: 'natural' },
  actions: { enabled: false },
  columns: [
    { kind: 'index', header: 'STT', widthClass: 'w-14' },
    { kind: 'text', name: 'name', header: 'Tên', widthClass: 'min-w-56' },
    {
      kind: 'number',
      name: 'quantity',
      header: 'Số lượng',
      min: 0,
      widthClass: 'w-32',
    },
  ],
};

export default spec;
