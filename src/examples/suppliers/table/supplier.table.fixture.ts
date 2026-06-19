import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'Supplier',
  modelImport: '../model/supplier',
  specPath: 'src/examples/suppliers/table/supplier.table.fixture.ts',
  columns: [
    {
      kind: 'text',
      id: 'code',
      header: 'Mã NCC',
      field: 'code',
      headerClassName: 'w-[120px]',
      size: 120,
      tooltipOnTruncate: true,
    },
    {
      kind: 'text',
      id: 'name',
      header: 'Tên nhà cung cấp',
      field: 'name',
      headerClassName: 'min-w-[260px]',
      size: 300,
      tooltipOnTruncate: true,
    },
    {
      kind: 'text',
      id: 'contact',
      header: 'Người liên hệ',
      field: 'contact',
      headerClassName: 'w-[180px]',
      size: 180,
      tooltipOnTruncate: true,
    },
    {
      kind: 'text',
      id: 'phone',
      header: 'Số điện thoại',
      field: 'phone',
      headerClassName: 'w-[150px]',
      size: 150,
    },
    {
      kind: 'currency',
      id: 'debt',
      header: 'Công nợ',
      field: 'debt',
      headerClassName: 'w-[150px]',
      size: 150,
    },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      headerClassName: 'w-[150px]',
      size: 150,
      config: {
        active: {
          label: 'Đang hợp tác',
          className:
            'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-[12px] text-admin-success-text',
          dotClassName: 'bg-admin-success-dot opacity-100',
        },
        paused: {
          label: 'Tạm dừng',
          variant: 'warning',
          className: 'rounded-md px-2.5 py-1 text-[12px]',
        },
        stopped: {
          label: 'Ngừng hợp tác',
          variant: 'outline',
          className: 'rounded-md px-2.5 py-1 text-[12px] text-muted-foreground',
          dotClassName: 'bg-admin-neutral-400 opacity-100',
        },
      },
    },
    {
      kind: 'date',
      id: 'startDate',
      header: 'Ngày hợp tác',
      field: 'startDate',
      headerClassName: 'w-[150px]',
      size: 150,
    },
    {
      kind: 'actions',
      header: 'Thao tác',
      headerClassName: 'w-[120px]',
      cellClassName: 'text-right',
      size: 120,
    },
  ],
};

export default spec;
