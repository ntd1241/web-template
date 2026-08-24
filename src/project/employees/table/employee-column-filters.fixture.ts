import type { ColumnFilterSpec } from '@/builders/column-filter';

const spec: ColumnFilterSpec = {
  componentName: 'Employee',
  specPath:
    'src/project/employees/table/employee-column-filters.fixture.ts',
  fields: [
    {
      type: 'search',
      name: 'text',
      placeholder: '',
      ariaLabel: 'Tìm theo tên hoặc mã nhân viên',
      className: 'min-w-0 w-full shrink-0 bg-background',
    },
    {
      type: 'multiSelect',
      name: 'roles',
      placeholder: '',
      searchPlaceholder: 'Tìm vai trò...',
      maxChips: 0,
      className: 'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
    },
    {
      type: 'multiSelect',
      name: 'status',
      placeholder: '',
      searchPlaceholder: 'Tìm trạng thái...',
      maxChips: 0,
      className: 'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
    },
    {
      type: 'selectSearch',
      name: 'account',
      placeholder: '',
      searchPlaceholder: 'Tìm trạng thái tài khoản...',
      ariaLabel: 'Tài khoản',
      className: 'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
    },
  ],
};

export default spec;
