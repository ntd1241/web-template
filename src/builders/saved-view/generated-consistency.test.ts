import { describe, expect, it } from 'vitest';
import { buildSavedViewModule } from './saved-view-builder';

describe('saved-view-builder generated consistency', () => {
  it('keeps adapters typed and free of any', () => {
    const generated = buildSavedViewModule({
      entity: 'Demo',
      modelImport: {
        specifier: '../model/demo',
        values: ['DEMO_LIST_INITIAL_FILTERS'],
        types: ['DemoFilters'],
      },
      filtersType: 'DemoFilters',
      initialFiltersName: 'DEMO_LIST_INITIAL_FILTERS',
      resource: 'customers',
      fields: [{ name: 'name', kind: 'string' }],
    });

    expect(generated).toContain('TenantSavedView<DemoFilters>');
    expect(generated).not.toContain(': any');
  });
});
