import type { ColumnFilterSpec } from '@/builders/column-filter';

const spec: ColumnFilterSpec = {
  componentName: 'Contract',
  specPath:
    'src/builders/column-filter/__fixtures__/showcase.column-filter.fixture.ts',
  fields: [
    {
      type: 'search',
      name: 'text',
      placeholder: '',
      ariaLabel: 'Tìm theo tên hoặc mã hợp đồng',
      className: 'min-w-0 w-full shrink-0',
    },
    {
      type: 'selectSearch',
      name: 'customer',
      placeholder: '',
      searchPlaceholder: 'Tìm khách hàng...',
      loadingMessage: 'Đang tải khách hàng...',
      ariaLabel: 'Khách hàng',
      className: 'h-7 min-h-7 min-w-0 flex-1 rounded-md bg-background px-2.5 text-xs',
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
      type: 'numberRange',
      name: 'outstanding',
      label: 'Còn phải thu',
      placeholder: '',
      className: 'min-w-0 w-full',
    },
    {
      type: 'dateRange',
      name: 'nextDue',
      label: 'Hạn gần nhất',
      placeholder: '',
      className: 'min-w-0 w-full',
    },
  ],
};

export default spec;
