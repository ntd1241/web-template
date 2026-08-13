import type { TableSpec } from '@/builders/table';

const spec: TableSpec = {
  entity: 'Employee',
  modelImport: '../model/employee',
  specPath: 'src/project/employees/table/employee.table.fixture.ts',
  columns: [
    { kind: 'index', header: 'STT' },
    {
      kind: 'text',
      id: 'employeeCode',
      header: 'Mã nhân viên',
      field: 'employeeCode',
    },
    {
      kind: 'custom',
      id: 'name',
      header: 'Nhân viên',
      headerClassName: 'min-w-[220px]',
    },
    {
      kind: 'text',
      id: 'department',
      header: 'Phòng ban',
      field: 'department',
    },
    { kind: 'text', id: 'jobTitle', header: 'Chức vụ', field: 'jobTitle' },
    {
      kind: 'badge',
      id: 'status',
      header: 'Trạng thái',
      field: 'status',
      config: {
        active: { label: 'Đang làm việc', variant: 'success' },
        inactive: { label: 'Ngừng làm việc', variant: 'secondary' },
      },
    },
    {
      kind: 'badge',
      id: 'account',
      header: 'Tài khoản',
      field: 'accountLinked',
      config: {
        true: { label: 'Đã liên kết', variant: 'success' },
        false: { label: 'Chưa liên kết', variant: 'outline' },
      },
    },
    {
      kind: 'actions',
      id: 'actions',
      header: '',
      headerClassName: 'w-[110px]',
      cellClassName: 'text-right',
    },
  ],
};

export default spec;
