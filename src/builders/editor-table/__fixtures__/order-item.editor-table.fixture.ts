import type { EditorTableSpec } from '../editor-table-spec';

const spec: EditorTableSpec = {
  entity: 'OrderItem',
  componentName: 'OrderItemsEditorTable',
  modelImport: './order-item',
  valuesType: 'OrderItemsFormValues',
  valuesImport: './order-item',
  arrayName: 'items',
  specPath:
    'src/builders/editor-table/__fixtures__/order-item.editor-table.fixture.ts',
  tableMinWidthClass: 'min-w-[1440px]',
  viewport: { mode: 'fixed', height: 'lg' },
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
      kind: 'date',
      name: 'expiryDate',
      header: 'Hạn dùng',
      widthClass: 'w-40',
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
