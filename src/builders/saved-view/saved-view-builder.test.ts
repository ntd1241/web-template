import { describe, expect, it } from 'vitest';
import { buildSavedViewModule } from './saved-view-builder';
import { savedViewSpecSchema } from './saved-view-spec';

const baseSpec = {
  entity: 'Employee',
  modelImport: {
    specifier: '../model/employee',
    values: ['EMPLOYEE_STATUSES', 'EMPLOYEE_LIST_INITIAL_FILTERS'],
    types: ['EmployeeListFilters'],
  },
  filtersType: 'EmployeeListFilters',
  initialFiltersName: 'EMPLOYEE_LIST_INITIAL_FILTERS',
  resource: 'employees',
  managePermission: 'system:views:manage',
  fields: [
    {
      name: 'statuses',
      kind: 'enumArray',
      allowedValuesConst: 'EMPLOYEE_STATUSES',
    },
    { name: 'roleIds', kind: 'stringArray' },
    {
      name: 'accountLinked',
      kind: 'union',
      allowedValues: ['all', 'linked', 'unlinked'],
    },
    { name: 'tagIds', kind: 'stringArray' },
  ],
} as const;

describe('saved-view-builder', () => {
  it('emits a normalized tenant view adapter', () => {
    const source = buildSavedViewModule(baseSpec);
    expect(source).toContain('Scaffolded by saved-view-builder');
    expect(source).toContain('normalizeEmployeeSavedViewConfig');
    expect(source).toContain('EMPLOYEE_STATUSES.includes');
    expect(source).toContain('EMPLOYEE_LIST_INITIAL_FILTERS');
    expect(source).toContain('EmployeeSavedViewConfig');
  });

  it('rejects malformed field definitions', () => {
    expect(() =>
      savedViewSpecSchema.parse({
        ...baseSpec,
        fields: [{ name: 'statuses', kind: 'enumArray' }],
      }),
    ).toThrow(/allowedValuesConst/);
  });
});
