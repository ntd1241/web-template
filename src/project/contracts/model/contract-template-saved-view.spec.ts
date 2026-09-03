import type { SavedViewSpec } from '@/builders/saved-view';

const spec: SavedViewSpec = {
  entity: 'ContractTemplate',
  specPath: 'src/project/contracts/model/contract-template-saved-view.spec.ts',
  modelImport: {
    specifier: './contract-template',
    values: [
      'CONTRACT_TEMPLATE_STATUSES',
      'CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS',
    ],
    types: ['ContractTemplateListFilters'],
  },
  filtersType: 'ContractTemplateListFilters',
  initialFiltersName: 'CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS',
  resource: 'contract_templates',
  managePermission: 'system:views:manage',
  fields: [
    { name: 'templateSearch', kind: 'string' },
    {
      name: 'status',
      kind: 'union',
      allowedValues: ['all', ...['draft', 'published', 'archived']],
    },
    {
      name: 'statuses',
      kind: 'enumArray',
      allowedValuesConst: 'CONTRACT_TEMPLATE_STATUSES',
    },
    { name: 'tagIds', kind: 'stringArray' },
    { name: 'lineCountMin', kind: 'optionalNumber' },
    { name: 'lineCountMax', kind: 'optionalNumber' },
    { name: 'contractCountMin', kind: 'optionalNumber' },
    { name: 'contractCountMax', kind: 'optionalNumber' },
    { name: 'versionNoMin', kind: 'optionalNumber' },
    { name: 'versionNoMax', kind: 'optionalNumber' },
    { name: 'updatedFrom', kind: 'string' },
    { name: 'updatedTo', kind: 'string' },
  ],
};

export default spec;
