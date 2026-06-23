import type { TableSpec } from '@/builders/table';

/**
 * Table-builder spec for the materials management grid (pilot).
 *
 * Scaffold it with:
 *   npm run gen:table -- src/examples/material/table/material.table.fixture.ts \
 *     src/examples/material/components/material-columns.generated.tsx
 *
 * The generated hook is then OWNED: the `qr` / `identity` / `model` / `group` /
 * `tags` / `actions` cell stubs are filled in place. Re-running the builder
 * overwrites — point it at a scratch path
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
      kind: 'custom',
      id: 'model',
      header: 'Mẫu',
      field: 'modelId',
      headerClassName: 'w-[200px]',
      size: 200,
    },
    {
      kind: 'custom',
      id: 'group',
      header: 'Nhóm',
      headerClassName: 'w-[180px]',
      size: 180,
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
