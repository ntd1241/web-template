import type { FilterSpec } from '@/builders/filter';

const spec: FilterSpec = {
  componentName: 'ContractTemplateFilterBar',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm theo mã hoặc tên mẫu',
      className: 'w-72',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Trạng thái',
      placeholder: 'Trạng thái',
      ariaLabel: 'Trạng thái mẫu',
      className: 'w-44',
      optionsSource: 'prop',
    },
  ],
};

export default spec;
