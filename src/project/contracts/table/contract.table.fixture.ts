import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'Contract',
  modelImport: '../model/contract',
  specPath: 'src/project/contracts/table/contract.table.fixture.ts',
  columns: [
    { kind: 'select' },
    {
      kind: 'custom',
      id: 'contract',
      header: 'Hợp đồng',
      headerClassName: 'min-w-[440px]',
      size: 480,
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
          className:
            'rounded-md border-transparent bg-muted px-2.5 py-1 text-xs text-muted-foreground',
          dotClassName: 'bg-muted-foreground opacity-100',
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
            'rounded-md border-transparent bg-admin-amber-bg px-2.5 py-1 text-xs text-admin-amber-dark',
          dotClassName: 'bg-admin-amber-primary opacity-100',
        },
        expired: {
          label: 'Hết hạn',
          className:
            'rounded-md border-transparent bg-admin-red-bg px-2.5 py-1 text-xs text-admin-red-dark',
          dotClassName: 'bg-admin-red-primary opacity-100',
        },
        terminated: {
          label: 'Đã chấm dứt',
          className:
            'rounded-md border-transparent bg-muted px-2.5 py-1 text-xs text-muted-foreground',
          dotClassName: 'bg-muted-foreground opacity-100',
        },
      },
    },
    {
      kind: 'custom',
      id: 'endDate',
      header: 'Ngày hết hạn hợp đồng',
      headerClassName: 'w-[190px]',
      size: 190,
    },
    {
      kind: 'custom',
      id: 'nextDueDate',
      header: 'Hạn thu tiếp theo',
      headerClassName: 'w-[160px]',
      size: 160,
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
      kind: 'actions',
      id: 'actions',
      header: '',
      actionCount: 2,
      cellClassName: 'text-center',
    },
  ],
};

export default spec;
