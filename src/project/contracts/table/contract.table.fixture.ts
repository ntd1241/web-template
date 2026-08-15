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
      headerClassName: 'min-w-[250px]',
    },
    {
      kind: 'custom',
      id: 'customer',
      header: 'Khách hàng',
      headerClassName: 'min-w-[220px]',
    },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
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
      headerClassName: 'min-w-[150px]',
    },
    {
      kind: 'date',
      id: 'nextDueDate',
      header: 'Hạn gần nhất',
      field: 'nextDueDate',
      headerClassName: 'min-w-[140px]',
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      headerClassName: 'w-[110px]',
      cellClassName: 'text-right',
    },
  ],
};

export default spec;
