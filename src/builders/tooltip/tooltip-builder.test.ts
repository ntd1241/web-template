import { describe, expect, it } from 'vitest';
import { buildTooltipModule } from './tooltip-builder';
import { tooltipSpecSchema } from './tooltip-spec';

describe('tooltip-builder', () => {
  it('emits a tooltip wrapper and shared style provider', () => {
    const source = buildTooltipModule({
      componentName: 'ShowcaseTooltip',
      defaultStyle: 'compact',
      hideLabel: true,
      className: 'border-primary',
    });

    expect(source).toContain('Scaffolded by tooltip-builder');
    expect(source).toContain('ChartTooltipContent');
    expect(source).toContain('ChartTooltipStyleProvider');
    expect(source).toContain("style = 'compact'");
    expect(source).toContain("'border-primary'");
  });

  it('can omit the provider for a local tooltip-only wrapper', () => {
    const source = buildTooltipModule({
      componentName: 'LocalTooltip',
      includeProvider: false,
    });

    expect(source).not.toContain('ChartTooltipStyleProvider');
    expect(source).toContain('export function LocalTooltip');
  });

  it('rejects invalid component names', () => {
    expect(() =>
      tooltipSpecSchema.parse({ componentName: 'not-valid-name' }),
    ).toThrow(/định danh hợp lệ/);
  });
});
