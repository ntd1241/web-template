import { describe, expect, it } from 'vitest';
import { buildSegmentedControlModule } from './segmented-control-builder';
import { segmentedControlSpecSchema } from './segmented-control-spec';

const baseSpec = {
  componentName: 'PaymentViewSwitcher',
  ariaLabel: 'Cách hiển thị',
  options: [
    { value: 'period', label: 'Theo kỳ' },
    { value: 'month', label: 'Theo tháng' },
  ],
  size: 'lg',
  variant: 'outline',
  itemClassName: 'data-[state=on]:bg-primary',
} as const;

describe('segmented-control-builder', () => {
  it('emits a ToggleGroup with static options and guarded single selection', () => {
    const source = buildSegmentedControlModule(baseSpec);

    expect(source).toContain('Scaffolded by segmented-control-builder');
    expect(source).toContain('PaymentViewSwitcherOptions');
    expect(source).toContain('type="single"');
    expect(source).toContain('if (nextValue) onValueChange(nextValue);');
    expect(source).toContain("size='lg'");
    expect(source).toContain("variant='outline'");
  });

  it('supports prop options and allowing an empty selection', () => {
    const source = buildSegmentedControlModule({
      componentName: 'RuntimeSwitcher',
      ariaLabel: 'Chế độ',
      optionsSource: 'prop',
      allowEmpty: true,
    });

    expect(source).toContain('options: RuntimeSwitcherOption[];');
    expect(source).toContain('onValueChange={onValueChange}');
    expect(source).not.toContain('RuntimeSwitcherOptions');
  });

  it('rejects duplicate values and invalid option source combinations', () => {
    expect(() =>
      segmentedControlSpecSchema.parse({
        ...baseSpec,
        options: [
          { value: 'same', label: 'Một' },
          { value: 'same', label: 'Hai' },
        ],
      }),
    ).toThrow(/option value bị trùng/);

    expect(() =>
      segmentedControlSpecSchema.parse({
        componentName: 'StaticSwitcher',
        ariaLabel: 'Chế độ',
      }),
    ).toThrow(/options bắt buộc/);

    expect(() =>
      segmentedControlSpecSchema.parse({
        ...baseSpec,
        optionsSource: 'prop',
      }),
    ).toThrow(/không truyền options tĩnh/);
  });
});
