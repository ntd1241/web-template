import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'ContractVersion',
  modelImport: '../model/contract',
  specPath: 'src/project/contracts/table/contract-version.table.fixture.ts',
  columns: [
    {
      kind: 'custom',
      id: 'version',
      header: 'Phiên bản',
      headerClassName: 'min-w-[150px]',
      size: 170,
    },
    {
      kind: 'date',
      id: 'effectiveFrom',
      header: 'Ngày áp dụng',
      field: 'effectiveFrom',
      headerClassName: 'min-w-[150px]',
      size: 170,
      enableSorting: false,
    },
    {
      kind: 'date',
      id: 'effectiveTo',
      header: 'Ngày kết thúc',
      field: 'effectiveTo',
      headerClassName: 'min-w-[150px]',
      size: 170,
      enableSorting: false,
    },
    {
      kind: 'custom',
      id: 'changeReason',
      header: 'Lý do thay đổi',
      headerClassName: 'min-w-[320px]',
      size: 420,
    },
    {
      kind: 'custom',
      id: 'status',
      header: 'Trạng thái',
      headerClassName: 'min-w-[160px]',
      size: 180,
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      actionPresets: ['view', 'primary', 'edit'],
      headerClassName: 'w-[320px]',
      cellClassName: 'text-right',
      size: 320,
    },
  ],
};

export default spec;
