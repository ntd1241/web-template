import { describe, expect, it } from 'vitest';
import { buildColumnFilterModule } from './column-filter-builder';

describe('column-filter-builder generated consistency', () => {
  it('keeps generated output scaffold-marked and typed', () => {
    const generated = buildColumnFilterModule({
      componentName: 'Consistency',
      fields: [{ type: 'search', name: 'keyword' }],
    });

    expect(generated).toContain('Scaffolded by column-filter-builder');
    expect(generated).toContain("from '@/components/ui/inputs/search-input'");
    expect(generated).not.toContain(': any');
  });
});
