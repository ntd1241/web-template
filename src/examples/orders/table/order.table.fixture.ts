import type { TableSpec } from '@/builders/table';
import { ORDER_STATUS_LABELS, ORDER_STATUSES } from '../model/order';

const spec: TableSpec = {
  entity: 'Order',
  modelImport: '../model/order',
  specPath: 'src/examples/orders/table/order.table.fixture.ts',
  columns: [
    { kind: 'select' },
    { kind: 'text', id: 'code', header: 'Mã đơn', field: 'code' },
    {
      kind: 'text',
      id: 'customerName',
      header: 'Khách hàng',
      field: 'customerName',
      tooltipOnTruncate: true,
    },
    { kind: 'currency', id: 'total', header: 'Tổng tiền', field: 'total' },
    {
      kind: 'date',
      id: 'createdAt',
      header: 'Ngày tạo',
      field: 'createdAt',
      mode: 'date',
    },
    {
      kind: 'editableSelect',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      placeholder: 'Chọn trạng thái',
      options: ORDER_STATUSES.map((status) => ({
        value: status,
        label: ORDER_STATUS_LABELS[status],
      })),
    },
  ],
};

export default spec;
