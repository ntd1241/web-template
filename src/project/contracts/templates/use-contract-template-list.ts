import { useSubjectTagFilter } from '@/project/tags/hooks/use-subject-tag-filter';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import {
  loadContractTemplateList,
  loadContractTemplateStatusStats,
} from '../api/contract-templates.api';
import type {
  ContractTemplateListFilters,
  ContractTemplateListParams,
  ContractTemplateStatus,
} from '../model/contract-template';
import {
  CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS,
  CONTRACT_TEMPLATE_STATUSES,
} from '../model/contract-template';

export function useContractTemplateList() {
  const { tenantId, isPending, isError, error, refetch } = useTenant();
  const listState = useTableListState<ContractTemplateListFilters>({
    initialFilters: CONTRACT_TEMPLATE_LIST_INITIAL_FILTERS,
    initialPageSize: 10,
  });
  const queryParams = buildListQueryParams(listState, {
    filters: {
      templateSearch: { omit: [''] },
      statuses: {
        serialize: (value) => (value.length > 0 ? value.join(',') : undefined),
      },
      tagIds: {
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
    tagIds:
      typeof queryParams.tagIds === 'string'
        ? queryParams.tagIds.split(',').filter(Boolean)
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
  const subjectTagFilterQuery = useSubjectTagFilter('contract_template', {
    moduleCodes: ['contracts'],
  });
  const listQuery = useQuery({
    queryKey: ['project', 'contract-templates', 'list', tenantId, listParams],
    queryFn: ({ signal }) => {
      if (!tenantId) throw new Error('Chưa xác định tenant đang hoạt động.');
      return loadContractTemplateList(tenantId, listParams, signal);
    },
    enabled: Boolean(tenantId),
    placeholderData: keepPreviousData,
  });

  const statusStatsQuery = useQuery({
    queryKey: ['project', 'contract-templates', 'stats', tenantId],
    queryFn: ({ signal }) => loadContractTemplateStatusStats(tenantId!, signal),
    enabled: Boolean(tenantId),
  });

  return {
    ...listState,
    tenantQuery: { isPending, isError, error, refetch },
    listQuery,
    statusStatsQuery,
    contractTemplateTagOptions: subjectTagFilterQuery.data?.options ?? [],
    contractTemplateTagsByTemplateId:
      subjectTagFilterQuery.data?.tagsBySubjectId ?? {},
    contractTemplateTagOptionsQuery: subjectTagFilterQuery,
    templates: listQuery.data?.templates ?? [],
    total: listQuery.data?.total ?? 0,
  };
}
