import type { ColumnFilterSpec } from '@/builders/column-filter';

const spec: ColumnFilterSpec = {
  componentName: 'Customer',
  specPath: 'src/project/customers/table/customer-column-filters.fixture.ts',
  fields: [
    {
      type: 'search',
      name: 'text',
      placeholder: '',
      ariaLabel: 'Tìm theo tên hoặc mã khách hàng',
      className: 'min-w-0 w-full shrink-0 bg-background',
    },
    {
      type: 'multiSelect',
      name: 'businessType',
      placeholder: '',
      searchPlaceholder: 'Tìm loại hình...',
      maxChips: 0,
      optionsSource: 'prop',
      className: 'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
    },
    {
      type: 'search',
      name: 'contact',
      placeholder: '',
      ariaLabel: 'Tìm theo số điện thoại hoặc email',
      className: 'min-w-0 w-full shrink-0 bg-background',
    },
    {
      type: 'multiSelect',
      name: 'status',
      placeholder: '',
      searchPlaceholder: 'Tìm trạng thái...',
      maxChips: 0,
      optionsSource: 'prop',
      className: 'h-7 min-h-7 min-w-0 rounded-md bg-background px-2.5 text-xs',
    },
  ],
};

export default spec;
