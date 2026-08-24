import { describe, expect, it } from 'vitest';
import { buildFilterModule } from './filter-builder';

describe('filter-builder generated consistency', () => {
  it('keeps generated output typed and scaffold-marked', () => {
    const generated = buildFilterModule({
      componentName: 'ConsistencyFilterBar',
      fields: [{ type: 'search', name: 'keyword' }],
    });

    expect(generated).toContain('Scaffolded by filter-builder');
    expect(generated).toContain("from '@/components/ui/filter-toolbar'");
    expect(generated).not.toContain(': any');
  });
});
