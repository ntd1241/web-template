import type { TableSpec } from '../column-spec';

/**
 * Golden fixture spec for the table builder. Exercises every accessor kind plus
 * badge / custom / actions / index. `npm run gen:table` turns this into the
 * committed `employee.columns.generated.tsx` golden; the builder test asserts the
 * output still matches, so any builder drift fails CI.
 *
 * Named `.fixture.ts` (not `.spec.ts`) so vitest does not collect it as a test.
 */
const spec: TableSpec = {
  entity: 'Employee',
  modelImport: './employee',
  specPath: 'src/builders/table/__fixtures__/employee.table.fixture.ts',
  columns: [
    { kind: 'index', header: 'STT' },
    {
      kind: 'custom',
      id: 'name',
      header: 'Nhân viên',
      headerClassName: 'min-w-[240px]',
    },
    {
      kind: 'text',
      id: 'email',
      header: 'Email',
      field: 'email',
      tooltipOnTruncate: true,
    },
    { kind: 'currency', id: 'salary', header: 'Lương', field: 'salary' },
    {
      kind: 'percent',
      id: 'performance',
      header: 'Hiệu suất',
      field: 'performance',
      fractionDigits: 0,
    },
    {
      kind: 'date',
      id: 'startDate',
      header: 'Ngày vào',
      field: 'startDate',
      mode: 'date',
    },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      headerClassName: 'w-[140px]',
      config: {
        active: {
          label: 'Đang hoạt động',
          className: 'bg-admin-success-bg text-admin-success-text',
          dotClassName: 'bg-admin-success-dot',
        },
        locked: { label: 'Đã khóa', variant: 'outline' },
      },
    },
    {
      kind: 'editableSelect',
      id: 'statusSelect',
      header: 'Đổi trạng thái',
      field: 'status',
      placeholder: 'Chọn trạng thái',
      options: [
        { value: 'active', label: 'Đang hoạt động' },
        { value: 'locked', label: 'Đã khóa' },
      ],
    },
    {
      kind: 'actions',
      header: 'Thao tác',
      headerClassName: 'w-[120px]',
      cellClassName: 'text-right',
    },
  ],
};

export default spec;
