import type { TableSpec } from '@/builders/table';

/**
 * Table-builder spec cho danh mục thông số kỹ thuật.
 *
 *   npm run gen:table -- src/examples/material/specs/table/spec-definition.table.fixture.ts \
 *     src/examples/material/specs/components/spec-definition-columns.generated.tsx
 *
 * OWNED: điền các cell stub (`identity`, `unit`, `optionsCount`, `status`, `actions`).
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
      headerClassName: 'w-[150px]',
      size: 150,
      config: {
        text: { label: 'Văn bản', variant: 'secondary' },
        number: { label: 'Số + đơn vị', variant: 'info' },
        single_select: { label: 'Chọn 1', variant: 'primary' },
        multi_select: { label: 'Chọn nhiều', variant: 'primary' },
        boolean: { label: 'Có / Không', variant: 'warning' },
        date: { label: 'Ngày tháng', variant: 'secondary' },
      },
    },
    {
      kind: 'custom',
      id: 'unit',
      header: 'Đơn vị',
      headerClassName: 'w-[110px]',
      size: 110,
    },
    {
      kind: 'custom',
      id: 'optionsCount',
      header: 'Lựa chọn',
      headerClassName: 'w-[120px]',
      size: 120,
    },
    {
      kind: 'custom',
      id: 'status',
      header: 'Trạng thái',
      headerClassName: 'w-[130px]',
      size: 130,
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
