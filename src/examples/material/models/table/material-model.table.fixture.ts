import type { TableSpec } from '@/builders/table';

/**
 * Table-builder spec cho bảng mẫu vật tư.
 *
 *   npm run gen:table -- src/examples/material/models/table/material-model.table.fixture.ts \
 *     src/examples/material/models/components/material-model-columns.generated.tsx
 */
const spec: TableSpec = {
  entity: 'MaterialModel',
  modelImport: '../../model/material-model',
  specPath:
    'src/examples/material/models/table/material-model.table.fixture.ts',
  columns: [
    { kind: 'index', header: 'STT', headerClassName: 'w-[64px]', size: 64 },
    {
      kind: 'custom',
      id: 'identity',
      header: 'Mẫu vật tư',
      headerClassName: 'min-w-[260px]',
      size: 320,
    },
    {
      kind: 'custom',
      id: 'group',
      header: 'Nhóm',
      headerClassName: 'w-[170px]',
      size: 170,
    },
    {
      kind: 'custom',
      id: 'origin',
      header: 'Xuất xứ',
      headerClassName: 'w-[140px]',
      size: 140,
    },
    {
      kind: 'custom',
      id: 'specCount',
      header: 'Thông số',
      headerClassName: 'w-[110px]',
      size: 110,
    },
    {
      kind: 'custom',
      id: 'deviceCount',
      header: 'Thiết bị',
      headerClassName: 'w-[110px]',
      size: 110,
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
