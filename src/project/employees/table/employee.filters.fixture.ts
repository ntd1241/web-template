import type { FilterSpec } from '@/builders/filter';

const spec: FilterSpec = {
  componentName: 'EmployeeFilterBar',
  fields: [
    {
      type: 'select',
      name: 'tag',
      placeholder: 'Tất cả nhóm',
      ariaLabel: 'Nhóm nhân viên',
      optionsSource: 'prop',
      className: 'w-48',
    },
  ],
};

export default spec;
