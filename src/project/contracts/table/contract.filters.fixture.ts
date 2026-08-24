import type { FilterSpec } from '@/builders/filter';

const spec: FilterSpec = {
  componentName: 'ContractFilterBar',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm theo mã, tên hoặc khách hàng',
      className: 'w-72',
    },
  ],
};

export default spec;
