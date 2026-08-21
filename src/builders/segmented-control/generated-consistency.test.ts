import { describe, expect, it } from 'vitest';
import { buildSegmentedControlModule } from './segmented-control-builder';

describe('segmented-control-builder generated consistency', () => {
  it('keeps generated output marked as scaffold-and-own', () => {
    const generated = buildSegmentedControlModule({
      componentName: 'ShowcaseSegmentedControl',
      ariaLabel: 'Chế độ hiển thị',
      options: [{ value: 'one', label: 'Một' }],
    });

    expect(generated).toContain('Scaffolded by segmented-control-builder');
    expect(generated).toContain('ToggleGroupItem');
    expect(generated).not.toContain(': any');
  });
});
