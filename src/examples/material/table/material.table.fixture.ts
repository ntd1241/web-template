import type { TableSpec } from '@/builders/table';

/**
 * Table-builder spec for the materials management grid (pilot).
 *
 * Scaffold it with:
 *   npm run gen:table -- src/examples/material/table/material.table.fixture.ts \
 *     src/examples/material/components/material-columns.generated.tsx
 *
 * The generated hook is then OWNED: the `qr` / `identity` / `tags` / `actions`
 * cell stubs are filled in place. The clean accessor column (`group` badge) is
 * fully generated. Re-running the builder overwrites — point it at a scratch path
 * when refreshing a file you've customized.
 */
const spec: TableSpec = {
  entity: 'Material',
  modelImport: '../model/material',
  specPath: 'src/examples/material/table/material.table.fixture.ts',
  columns: [
    { kind: 'index', header: 'STT', headerClassName: 'w-[64px]', size: 64 },
    {
      kind: 'custom',
      id: 'qr',
      header: 'QR',
      headerClassName: 'w-[88px]',
      size: 88,
    },
    {
      kind: 'custom',
      id: 'identity',
      header: 'Vật tư',
      headerClassName: 'min-w-[280px]',
      size: 340,
    },
    {
      kind: 'badge',
      id: 'group',
      header: 'Nhóm',
      field: 'group',
      headerClassName: 'w-[180px]',
      size: 180,
      config: {
        'kiem-ke': { label: 'Thiết bị kiểm kê', variant: 'primary' },
        'van-phong': { label: 'Văn phòng', variant: 'secondary' },
        'an-toan': { label: 'An toàn lao động', variant: 'warning' },
        'cong-cu': { label: 'Công cụ - dụng cụ', variant: 'info' },
      },
    },
    {
      kind: 'custom',
      id: 'tags',
      header: 'Thẻ',
      field: 'tags',
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
