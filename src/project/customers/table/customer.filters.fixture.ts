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
  ],
};

export default spec;
