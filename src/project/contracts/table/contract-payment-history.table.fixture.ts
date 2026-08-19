import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'ContractPaymentHistory',
  modelImport: '../model/receivable',
  specPath:
    'src/project/contracts/table/contract-payment-history.table.fixture.ts',
  columns: [
    {
      kind: 'date',
      id: 'receivedAt',
      header: 'Ngày nhận',
      field: 'receivedAt',
      headerClassName: 'min-w-[130px]',
      size: 150,
      enableSorting: false,
    },
    {
      kind: 'custom',
      id: 'allocations',
      header: 'Khoản phí / kỳ',
      headerClassName: 'min-w-[360px]',
      size: 420,
    },
    {
      kind: 'custom',
      id: 'paymentMethod',
      header: 'Phương thức',
      headerClassName: 'min-w-[130px]',
      size: 150,
    },
    {
      kind: 'custom',
      id: 'reference',
      header: 'Mã tham chiếu',
      headerClassName: 'min-w-[150px]',
      size: 180,
    },
    {
      kind: 'custom',
      id: 'amount',
      header: 'Tổng thanh toán',
      headerClassName: 'min-w-[160px] text-right',
      cellClassName: 'text-right font-semibold tabular-nums',
      size: 180,
    },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      headerClassName: 'min-w-[130px]',
      size: 150,
      config: {
        posted: {
          label: 'Đã ghi nhận',
          className:
            'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
          dotClassName: 'bg-admin-success-dot opacity-100',
        },
        reversed: {
          label: 'Đã đảo ngược',
          variant: 'destructive',
          className: 'rounded-md px-2.5 py-1 text-xs',
        },
      },
    },
  ],
};

export default spec;
