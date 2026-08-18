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
      size: 260,
    },
    {
      kind: 'custom',
      id: 'fees',
      header: 'Các khoản phí',
      headerClassName: 'min-w-[240px]',
      size: 300,
    },
    {
      kind: 'date',
      id: 'dueDate',
      header: 'Hạn thanh toán',
      field: 'dueDate',
      headerClassName: 'min-w-[150px]',
      size: 170,
      enableSorting: false,
    },
    {
      kind: 'custom',
      id: 'amount',
      header: 'Số tiền',
      headerClassName: 'min-w-[150px] text-right',
      cellClassName: 'text-right tabular-nums',
      size: 160,
    },
    {
      kind: 'custom',
      id: 'outstandingAmount',
      header: 'Còn lại',
      headerClassName: 'min-w-[150px] text-right',
      cellClassName: 'text-right font-semibold tabular-nums',
      size: 160,
    },
    {
      kind: 'custom',
      id: 'displayStatus',
      header: 'Trạng thái',
      headerClassName: 'min-w-[140px]',
      size: 180,
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      headerClassName: 'w-[130px]',
      cellClassName: 'text-right',
      size: 130,
    },
  ],
};

export default spec;
