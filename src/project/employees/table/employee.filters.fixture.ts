import type { FilterSpec } from '@/builders/filter';

const spec: FilterSpec = {
  componentName: 'EmployeeFilterBar',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm theo tên, mã hoặc chức vụ',
      className: 'w-64',
    },
  ],
};

export default spec;
