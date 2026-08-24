import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { loadContractTemplateList } from '../api/contract-templates.api';
import type {
  ContractTemplateListParams,
  ContractTemplateStatus,
} from '../model/contract-template';
import { CONTRACT_TEMPLATE_STATUSES } from '../model/contract-template';

export interface ContractTemplateListFilters {
  templateSearch: string;
  status: 'all' | ContractTemplateStatus;
  statuses: ContractTemplateStatus[];
  lineCountMin?: number;
  lineCountMax?: number;
  contractCountMin?: number;
  contractCountMax?: number;
  versionNoMin?: number;
  versionNoMax?: number;
  updatedFrom: string;
  updatedTo: string;
}

export function useContractTemplateList() {
  const { tenantId, isPending, isError, error, refetch } = useTenant();
  const listState = useTableListState<ContractTemplateListFilters>({
    initialFilters: {
      templateSearch: '',
      status: 'all',
      statuses: [],
      lineCountMin: undefined,
      lineCountMax: undefined,
      contractCountMin: undefined,
      contractCountMax: undefined,
      versionNoMin: undefined,
      versionNoMax: undefined,
      updatedFrom: '',
      updatedTo: '',
    },
    initialPageSize: 10,
  });
  const queryParams = buildListQueryParams(listState, {
    filters: {
      templateSearch: { omit: [''] },
      statuses: {
        serialize: (value) => (value.length > 0 ? value.join(',') : undefined),
      },
      lineCountMin: {},
      lineCountMax: {},
      contractCountMin: {},
      contractCountMax: {},
      versionNoMin: {},
      versionNoMax: {},
      updatedFrom: { omit: [''] },
      updatedTo: { omit: [''] },
    },
  });
  const listParams: ContractTemplateListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search:
      typeof queryParams.search === 'string' ? queryParams.search : undefined,
    templateSearch:
      typeof queryParams.templateSearch === 'string'
        ? queryParams.templateSearch
        : undefined,
    statuses:
      typeof queryParams.statuses === 'string'
        ? queryParams.statuses
            .split(',')
            .filter((value): value is ContractTemplateStatus =>
              CONTRACT_TEMPLATE_STATUSES.includes(
                value as ContractTemplateStatus,
              ),
            )
        : undefined,
    lineCountMin:
      typeof queryParams.lineCountMin === 'number'
        ? queryParams.lineCountMin
        : undefined,
    lineCountMax:
      typeof queryParams.lineCountMax === 'number'
        ? queryParams.lineCountMax
        : undefined,
    contractCountMin:
      typeof queryParams.contractCountMin === 'number'
        ? queryParams.contractCountMin
        : undefined,
    contractCountMax:
      typeof queryParams.contractCountMax === 'number'
        ? queryParams.contractCountMax
        : undefined,
    versionNoMin:
      typeof queryParams.versionNoMin === 'number'
        ? queryParams.versionNoMin
        : undefined,
    versionNoMax:
      typeof queryParams.versionNoMax === 'number'
        ? queryParams.versionNoMax
        : undefined,
    updatedFrom:
      typeof queryParams.updatedFrom === 'string'
        ? queryParams.updatedFrom
        : undefined,
    updatedTo:
      typeof queryParams.updatedTo === 'string'
        ? queryParams.updatedTo
        : undefined,
  };
  const listQuery = useQuery({
    queryKey: ['project', 'contract-templates', 'list', tenantId, listParams],
    queryFn: ({ signal }) => {
      if (!tenantId) throw new Error('Chưa xác định tenant đang hoạt động.');
      return loadContractTemplateList(tenantId, listParams, signal);
    },
    enabled: Boolean(tenantId),
    placeholderData: keepPreviousData,
  });

  return {
    ...listState,
    tenantQuery: { isPending, isError, error, refetch },
    listQuery,
    templates: listQuery.data?.templates ?? [],
    total: listQuery.data?.total ?? 0,
  };
}
