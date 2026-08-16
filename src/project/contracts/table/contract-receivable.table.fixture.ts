import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'ContractReceivableTableRow',
  modelImport: '../model/receivable',
  specPath: 'src/project/contracts/table/contract-receivable.table.fixture.ts',
  columns: [
    {
      kind: 'custom',
      id: 'period',
      header: 'Kỳ',
      headerClassName: 'min-w-[220px]',
    },
    {
      kind: 'custom',
      id: 'fees',
      header: 'Các khoản phí',
      headerClassName: 'min-w-[240px]',
    },
    {
      kind: 'date',
      id: 'dueDate',
      header: 'Hạn thanh toán',
      field: 'dueDate',
      headerClassName: 'min-w-[150px]',
      enableSorting: false,
    },
    {
      kind: 'custom',
      id: 'amount',
      header: 'Số tiền',
      headerClassName: 'min-w-[150px] text-right',
      cellClassName: 'text-right tabular-nums',
    },
    {
      kind: 'custom',
      id: 'outstandingAmount',
      header: 'Còn lại',
      headerClassName: 'min-w-[150px] text-right',
      cellClassName: 'text-right font-semibold tabular-nums',
    },
    {
      kind: 'custom',
      id: 'displayStatus',
      header: 'Trạng thái',
      headerClassName: 'min-w-[140px]',
    },
  ],
};

export default spec;
