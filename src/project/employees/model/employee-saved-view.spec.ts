import type { SavedViewSpec } from '@/builders/saved-view';

const spec: SavedViewSpec = {
  entity: 'Employee',
  specPath: 'src/project/employees/model/employee-saved-view.spec.ts',
  modelImport: {
    specifier: './employee',
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
};

export default spec;
