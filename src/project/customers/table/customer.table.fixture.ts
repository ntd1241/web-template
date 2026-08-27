import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'Customer',
  modelImport: '../model/customer',
  specPath: 'src/project/customers/table/customer.table.fixture.ts',
  columns: [
    {
      kind: 'custom',
      id: 'name',
      header: 'Khách hàng',
      headerClassName: 'min-w-[240px]',
    },
    {
      kind: 'custom',
      id: 'businessType',
      header: 'Loại hình đơn vị',
      headerClassName: 'min-w-[160px]',
    },
    {
      kind: 'custom',
      id: 'contact',
      header: 'Liên hệ',
      headerClassName: 'min-w-[220px]',
    },
    {
      kind: 'custom',
      id: 'tags',
      header: 'Nhóm/nhãn',
      headerClassName: 'min-w-[220px]',
      size: 240,
    },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      config: {
        active: {
          label: 'Đang hoạt động',
          className:
            'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
          dotClassName: 'bg-admin-success-dot opacity-100',
        },
        inactive: {
          label: 'Ngừng hoạt động',
          variant: 'outline',
          className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
          dotClassName: 'bg-admin-neutral-400 opacity-100',
        },
      },
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
