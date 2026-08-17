import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'Contract',
  modelImport: '../model/contract',
  specPath: 'src/project/contracts/table/contract.table.fixture.ts',
  columns: [
    {
      kind: 'custom',
      id: 'contract',
      header: 'Hợp đồng',
      headerClassName: 'min-w-[320px]',
      size: 340,
    },
    {
      kind: 'custom',
      id: 'customer',
      header: 'Khách hàng',
      headerClassName: 'min-w-[240px]',
      size: 280,
    },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      headerClassName: 'w-[140px]',
      cellClassName: 'px-3',
      size: 140,
      config: {
        draft: {
          label: 'Bản nháp',
          variant: 'outline',
          className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
        },
        active: {
          label: 'Đang hiệu lực',
          className:
            'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
          dotClassName: 'bg-admin-success-dot opacity-100',
        },
        suspended: {
          label: 'Tạm dừng',
          className:
            'rounded-md border-transparent bg-admin-warning-bg px-2.5 py-1 text-xs text-admin-warning-text',
          dotClassName: 'bg-admin-warning-dot opacity-100',
        },
        expired: {
          label: 'Hết hạn',
          variant: 'outline',
          className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
        },
        terminated: {
          label: 'Đã chấm dứt',
          variant: 'outline',
          className: 'rounded-md px-2.5 py-1 text-xs text-destructive',
        },
      },
    },
    {
      kind: 'currency',
      id: 'totalOutstanding',
      header: 'Còn phải thu',
      field: 'totalOutstanding',
      headerClassName: 'w-[150px]',
      cellClassName: 'px-3',
      size: 150,
    },
    {
      kind: 'date',
      id: 'nextDueDate',
      header: 'Hạn gần nhất',
      field: 'nextDueDate',
      headerClassName: 'w-[160px]',
      size: 160,
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      headerClassName: 'w-[100px]',
      size: 100,
      cellClassName: 'text-right',
    },
  ],
};

export default spec;
