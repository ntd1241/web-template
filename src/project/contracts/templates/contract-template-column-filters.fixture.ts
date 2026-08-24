import type { ColumnFilterSpec } from '@/builders/column-filter';

const spec: ColumnFilterSpec = {
  componentName: 'ContractTemplate',
  specPath:
    'src/project/contracts/templates/contract-template-column-filters.fixture.ts',
  fields: [
    {
      type: 'search',
      name: 'text',
      placeholder: '',
      ariaLabel: 'Tìm theo tên hoặc mã mẫu hợp đồng',
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
    {
      type: 'numberRange',
      name: 'lineCount',
      label: 'Khoản phí',
      placeholder: '',
      className: 'min-w-0 w-full',
    },
    {
      type: 'numberRange',
      name: 'contractCount',
      label: 'Hợp đồng đã tạo',
      placeholder: '',
      className: 'min-w-0 w-full',
    },
    {
      type: 'numberRange',
      name: 'versionNo',
      label: 'Phiên bản',
      placeholder: '',
      className: 'min-w-0 w-full',
    },
    {
      type: 'dateRange',
      name: 'updatedAt',
      label: 'Cập nhật gần nhất',
      placeholder: '',
      className: 'min-w-0 w-full',
    },
  ],
};

export default spec;
