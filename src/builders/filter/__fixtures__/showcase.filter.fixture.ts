import type { FilterSpec } from '../filter-spec';

const spec: FilterSpec = {
  componentName: 'ShowcaseFilterBar',
  specPath: 'src/builders/filter/__fixtures__/showcase.filter.fixture.ts',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm kiếm...',
      className: 'w-64',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Trạng thái',
      placeholder: 'Trạng thái',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'active', label: 'Đang hoạt động' },
      ],
      className: 'w-44',
    },
  ],
};

export default spec;
