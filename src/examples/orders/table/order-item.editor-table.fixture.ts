import type { EditorTableSpec } from '@/builders/editor-table';

const spec: EditorTableSpec = {
  entity: 'OrderItem',
  componentName: 'OrderItemsEditorTable',
  modelImport: '../model/order',
  valuesType: 'OrderItemsFormValues',
  valuesImport: '../form/order-items.schema',
  arrayName: 'items',
  tableMinWidthClass: 'min-w-[1880px]',
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
    { kind: 'text', name: 'unit', header: 'ĐVT', widthClass: 'w-28' },
    { kind: 'text', name: 'warehouse', header: 'Kho', widthClass: 'w-36' },
    { kind: 'text', name: 'lotNumber', header: 'Số lô', widthClass: 'w-40' },
    {
      kind: 'date',
      name: 'expiryDate',
      header: 'Hạn dùng',
      widthClass: 'w-40',
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
    },
    {
      kind: 'number',
      name: 'discount',
      header: 'Chiết khấu',
      min: 0,
      widthClass: 'w-36',
    },
    { kind: 'text', name: 'note', header: 'Ghi chú', widthClass: 'min-w-48' },
    {
      kind: 'computedCurrency',
      id: 'lineTotal',
      header: 'Thành tiền',
      widthClass: 'w-40',
    },
  ],
};

export default spec;
