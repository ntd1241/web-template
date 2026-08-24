import { describe, expect, it } from 'vitest';
import { buildFilterModule } from './filter-builder';
import { filterSpecSchema } from './filter-spec';

const baseSpec = {
  componentName: 'PaymentFilterBar',
  fields: [
    {
      type: 'search',
      name: 'keyword',
      placeholder: 'Tìm theo tên',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Trạng thái',
      options: [
        { value: 'all', label: 'Tất cả' },
        { value: 'active', label: 'Đang hoạt động' },
      ],
    },
  ],
} as const;

describe('filter-builder', () => {
  it('emits typed search/select props and renderer slots', () => {
    const source = buildFilterModule(baseSpec);

    expect(source).toContain('Scaffolded by filter-builder');
    expect(source).toContain('StatusFilterOption');
    expect(source).toContain('statusRenderOption');
    expect(source).toContain("kind: 'search'");
    expect(source).toContain("kind: 'select'");
    expect(source).not.toContain(': any');
  });

  it('supports runtime select options', () => {
    const source = buildFilterModule({
      componentName: 'RuntimeFilterBar',
      fields: [
        {
          type: 'select',
          name: 'department',
          optionsSource: 'prop',
        },
      ],
    });

    expect(source).toContain(
      'departmentOptions: readonly DepartmentFilterOption[];',
    );
    expect(source).toContain('options: departmentOptions ?? [],');
    expect(source).not.toContain('const departmentOptions:');
  });

  it('rejects duplicate fields and invalid option source combinations', () => {
    expect(() =>
      filterSpecSchema.parse({
        componentName: 'DuplicateFilterBar',
        fields: [
          { type: 'search', name: 'keyword' },
          { type: 'search', name: 'keyword' },
        ],
      }),
    ).toThrow(/field name bị trùng/);

    expect(() =>
      filterSpecSchema.parse({
        componentName: 'StaticFilterBar',
        fields: [{ type: 'select', name: 'status' }],
      }),
    ).toThrow(/options bắt buộc/);

    expect(() =>
      filterSpecSchema.parse({
        componentName: 'PropFilterBar',
        fields: [
          {
            type: 'select',
            name: 'status',
            optionsSource: 'prop',
            options: [{ value: 'active', label: 'Active' }],
          },
        ],
      }),
    ).toThrow(/không truyền options tĩnh/);
  });
});
