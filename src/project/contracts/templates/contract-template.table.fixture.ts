import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'ContractTemplate',
  modelImport: '../model/contract-template',
  specPath:
    'src/project/contracts/templates/contract-template.table.fixture.ts',
  columns: [
    {
      kind: 'custom',
      id: 'template',
      header: 'Mẫu hợp đồng',
      headerClassName: 'min-w-[300px]',
      size: 340,
    },
    {
      kind: 'custom',
      id: 'status',
      header: 'Trạng thái',
      headerClassName: 'w-[150px]',
      size: 150,
    },
    {
      kind: 'custom',
      id: 'tags',
      header: 'Nhóm/nhãn',
      headerClassName: 'min-w-[220px]',
      size: 240,
    },
    {
      kind: 'number',
      id: 'lineCount',
      header: 'Khoản phí',
      field: 'lineCount',
      headerClassName: 'w-[120px]',
      size: 120,
    },
    {
      kind: 'number',
      id: 'contractCount',
      header: 'Hợp đồng đã tạo',
      field: 'contractCount',
      headerClassName: 'w-[160px]',
      size: 160,
    },
    {
      kind: 'custom',
      id: 'version',
      header: 'Phiên bản',
      headerClassName: 'w-[130px]',
      size: 130,
    },
    {
      kind: 'date',
      id: 'updatedAt',
      header: 'Cập nhật gần nhất',
      field: 'updatedAt',
      headerClassName: 'w-[170px]',
      size: 170,
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
