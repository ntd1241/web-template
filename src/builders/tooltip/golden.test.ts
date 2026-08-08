import { describe, expect, it } from 'vitest';
import { buildTooltipModule } from './tooltip-builder';

describe('tooltip-builder golden fixture', () => {
  it('reproduces a shared tooltip scaffold', () => {
    expect(
      buildTooltipModule({
        componentName: 'ShowcaseTooltip',
        defaultStyle: 'emphasis',
      }),
    ).toMatchSnapshot();
  });
});
