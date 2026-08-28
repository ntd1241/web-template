import { describe, expect, it } from 'vitest';
import {
  customerSavedViewConfigEquals,
  normalizeCustomerSavedViewConfig,
} from './customer-saved-view';

describe('customer saved view config', () => {
  it('normalizes stale or invalid persisted values without breaking the page', () => {
    expect(
      normalizeCustomerSavedViewConfig({
        keyword: '  miền nam  ',
        filters: {
          customerSearch: 'ABC',
          businessTypes: ['organization', 'removed-type'],
          statuses: ['active', 'removed-status'],
          tagIds: ['tag-1', 10],
        },
        columnVisibility: { contact: false, unknown: 'false' },
        columnOrder: ['tags', 10, 'name'],
      }),
    ).toEqual({
      version: 1,
      keyword: '  miền nam  ',
      filters: {
        customerSearch: 'ABC',
        businessTypes: ['organization'],
        contactSearch: '',
        statuses: ['active'],
        tagIds: ['tag-1'],
      },
      columnVisibility: { contact: false },
      columnOrder: ['tags', 'name'],
    });
  });

  it('compares the complete config for the explicit save action', () => {
    const config = normalizeCustomerSavedViewConfig({
      filters: { statuses: ['active'] },
      columnVisibility: { contact: false },
      columnOrder: ['name', 'status'],
    });

    expect(customerSavedViewConfigEquals(config, { ...config })).toBe(true);
    expect(
      customerSavedViewConfigEquals(config, {
        ...config,
        columnVisibility: { contact: true },
      }),
    ).toBe(false);
  });
});
