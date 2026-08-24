import { describe, expect, it } from 'vitest';
import { buildColumnFilterModule } from './column-filter-builder';
import { columnFilterSpecSchema } from './column-filter-spec';

const baseSpec = {
  componentName: 'Contract',
  fields: [
    { type: 'search', name: 'text', placeholder: 'Tìm kiếm' },
    { type: 'selectSearch', name: 'customer', optionsSource: 'prop' },
    { type: 'multiSelect', name: 'status', optionsSource: 'prop' },
    { type: 'numberRange', name: 'outstanding', label: 'Còn phải thu' },
    { type: 'dateRange', name: 'nextDue', label: 'Hạn gần nhất' },
  ],
} as const;

describe('column-filter-builder', () => {
  it('emits all supported column filter controls with typed props', () => {
    const source = buildColumnFilterModule(baseSpec);

    expect(source).toContain('Scaffolded by column-filter-builder');
    expect(source).toContain('ContractTextColumnFilter');
    expect(source).toContain('ContractCustomerColumnFilter');
    expect(source).toContain('ContractStatusColumnFilter');
    expect(source).toContain('NumberRangeFilter');
    expect(source).toContain('DateRangeFilter');
    expect(source).toContain("options: SearchSelectOption[];");
    expect(source).toContain('onChange: (value: string[]) => void;');
    expect(source).not.toContain(': any');
  });

  it('emits static options for select and multi-select fields', () => {
    const source = buildColumnFilterModule({
      componentName: 'Payment',
      fields: [
        {
          type: 'selectSearch',
          name: 'method',
          options: [{ value: 'cash', label: 'Tiền mặt' }],
        },
        {
          type: 'multiSelect',
          name: 'status',
          options: [{ value: 'paid', label: 'Đã thanh toán' }],
        },
      ],
    });

    expect(source).toContain('PaymentMethodOptions');
    expect(source).toContain('PaymentStatusOptions');
    expect(source).toContain(
      'options = PaymentMethodOptions,',
    );
  });

  it('rejects duplicate fields and invalid option sources', () => {
    expect(() =>
      columnFilterSpecSchema.parse({
        componentName: 'Duplicate',
        fields: [
          { type: 'search', name: 'query' },
          { type: 'search', name: 'query' },
        ],
      }),
    ).toThrow(/field name bị trùng/);

    expect(() =>
      columnFilterSpecSchema.parse({
        componentName: 'Static',
        fields: [
          { type: 'multiSelect', name: 'status', optionsSource: 'static' },
        ],
      }),
    ).toThrow(/options bắt buộc/);

    expect(() =>
      columnFilterSpecSchema.parse({
        componentName: 'Prop',
        fields: [
          {
            type: 'selectSearch',
            name: 'customer',
            optionsSource: 'prop',
            options: [{ value: 'one', label: 'Một' }],
          },
        ],
      }),
    ).toThrow(/không truyền options tĩnh/);
  });
});
