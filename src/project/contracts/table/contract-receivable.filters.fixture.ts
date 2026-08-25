import type { FilterSpec } from '@/builders/filter';

const spec: FilterSpec = {
  componentName: 'ContractReceivableFilterBar',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm theo khoản phí hoặc ngày',
      className: 'w-72',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Trạng thái',
      placeholder: 'Trạng thái',
      ariaLabel: 'Lọc trạng thái kỳ thanh toán',
      className: 'w-48',
      optionsSource: 'prop',
    },
  ],
};

export default spec;
