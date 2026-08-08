import { describe, expect, it } from 'vitest';
import { buildTooltipModule } from './tooltip-builder';

describe('tooltip-builder generated consistency', () => {
  it('keeps generated output marked as scaffold-and-own', () => {
    const generated = buildTooltipModule({ componentName: 'ShowcaseTooltip' });

    expect(generated).toContain('Scaffolded by tooltip-builder');
    expect(generated).toContain('ChartTooltipContent');
    expect(generated).not.toContain(': any');
  });
});
