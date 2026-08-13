import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'Tag',
  modelImport: '../model/tag',
  specPath: 'src/project/tags/table/tag.table.fixture.ts',
  columns: [
    {
      kind: 'custom',
      id: 'name',
      header: 'Nhãn',
      headerClassName: 'min-w-[220px]',
    },
    {
      kind: 'text',
      id: 'description',
      header: 'Mô tả',
      field: 'description',
      headerClassName: 'min-w-[280px]',
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      headerClassName: 'w-[220px]',
      cellClassName: 'text-right',
    },
  ],
};

export default spec;
