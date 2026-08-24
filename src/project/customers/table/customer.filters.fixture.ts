import type { FilterSpec } from '@/builders/filter';

const spec: FilterSpec = {
  componentName: 'CustomerFilterBar',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm theo tên hoặc mã khách hàng',
      className: 'w-64',
    },
    {
      type: 'select',
      name: 'tag',
      placeholder: 'Tất cả nhóm',
      ariaLabel: 'Nhóm khách hàng',
      optionsSource: 'prop',
      className: 'w-48',
    },
  ],
};

export default spec;
