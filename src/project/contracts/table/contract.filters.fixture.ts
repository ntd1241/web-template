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
    {
      type: 'select',
      name: 'status',
      label: 'Trạng thái',
      placeholder: 'Trạng thái',
      ariaLabel: 'Trạng thái hợp đồng',
      className: 'w-44',
      optionsSource: 'prop',
    },
  ],
};

export default spec;
