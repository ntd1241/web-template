import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'CustomField',
  modelImport: '../model/custom-field',
  specPath:
    'src/project/data-configuration/table/custom-field.table.fixture.ts',
  columns: [
    {
      kind: 'text',
      id: 'label',
      header: 'Tên trường',
      field: 'label',
      headerClassName: 'min-w-[220px]',
    },
    {
      kind: 'text',
      id: 'key',
      header: 'Mã trường',
      field: 'key',
      headerClassName: 'min-w-[180px]',
    },
    {
      kind: 'custom',
      id: 'fieldType',
      header: 'Kiểu dữ liệu',
      headerClassName: 'min-w-[180px]',
    },
    {
      kind: 'custom',
      id: 'isRequired',
      header: 'Bắt buộc',
      headerClassName: 'w-[120px]',
    },
    {
      kind: 'custom',
      id: 'isActive',
      header: 'Trạng thái',
      headerClassName: 'w-[140px]',
    },
    {
      kind: 'number',
      id: 'sortOrder',
      header: 'Thứ tự',
      field: 'sortOrder',
      headerClassName: 'w-[100px]',
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      actionCount: 2,
      actionPresets: ['edit', 'delete'],
    },
  ],
};

export default spec;
