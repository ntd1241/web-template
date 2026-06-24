import type { TableSpec } from '@/builders/table';

/**
 * Table-builder spec cho danh mục thông số kỹ thuật.
 *
 *   npm run gen:table -- src/examples/material/specs/table/spec-definition.table.fixture.ts \
 *     src/examples/material/specs/components/spec-definition-columns.generated.tsx
 *
 * OWNED: điền các cell stub (`identity`, `dataType`, `defaultValue`, `actions`).
 */
const spec: TableSpec = {
  entity: 'SpecDefinition',
  modelImport: '../../model/spec-definition',
  specPath:
    'src/examples/material/specs/table/spec-definition.table.fixture.ts',
  columns: [
    { kind: 'index', header: 'STT', headerClassName: 'w-[64px]', size: 64 },
    {
      kind: 'custom',
      id: 'identity',
      header: 'Thông số',
      headerClassName: 'min-w-[240px]',
      size: 300,
    },
    {
      kind: 'badge',
      id: 'dataType',
      header: 'Kiểu dữ liệu',
      field: 'dataType',
      headerClassName: 'w-[170px]',
      size: 170,
      config: {
        text: { label: 'Văn bản', variant: 'secondary' },
        number: { label: 'Số + đơn vị', variant: 'info' },
        list: { label: 'Danh sách', variant: 'primary' },
        boolean: { label: 'Có / Không', variant: 'warning' },
        date: { label: 'Ngày tháng', variant: 'secondary' },
      },
    },
    {
      kind: 'custom',
      id: 'defaultValue',
      header: 'Giá trị mặc định',
      headerClassName: 'min-w-[220px]',
      size: 260,
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
