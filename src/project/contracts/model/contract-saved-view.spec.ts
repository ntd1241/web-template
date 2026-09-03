import type { SavedViewSpec } from '@/builders/saved-view';

const spec: SavedViewSpec = {
  entity: 'Contract',
  specPath: 'src/project/contracts/model/contract-saved-view.spec.ts',
  modelImport: {
    specifier: './contract',
    values: ['CONTRACT_STATUSES', 'CONTRACT_LIST_INITIAL_FILTERS'],
    types: ['ContractListFilters'],
  },
  filtersType: 'ContractListFilters',
  initialFiltersName: 'CONTRACT_LIST_INITIAL_FILTERS',
  resource: 'contracts',
  managePermission: 'system:views:manage',
  fields: [
    {
      name: 'status',
      kind: 'enumArray',
      allowedValuesConst: 'CONTRACT_STATUSES',
    },
    { name: 'contractSearch', kind: 'string' },
    { name: 'customerId', kind: 'string' },
    { name: 'outstandingMin', kind: 'optionalNumber' },
    { name: 'outstandingMax', kind: 'optionalNumber' },
    { name: 'nextDueFrom', kind: 'string' },
    { name: 'nextDueTo', kind: 'string' },
  ],
};

export default spec;
