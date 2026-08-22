import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { loadContractTemplateList } from '../api/contract-templates.api';
import type {
  ContractTemplateListParams,
  ContractTemplateStatus,
} from '../model/contract-template';

export interface ContractTemplateListFilters {
  status: 'all' | ContractTemplateStatus;
}

export function useContractTemplateList() {
  const { tenantId, isPending, isError, error, refetch } = useTenant();
  const listState = useTableListState<ContractTemplateListFilters>({
    initialFilters: { status: 'all' },
    initialPageSize: 10,
  });
  const listParams: ContractTemplateListParams = {
    page: listState.pagination.pageIndex + 1,
    pageSize: listState.pagination.pageSize,
    search: listState.keyword.trim() || undefined,
    status:
      listState.filters.status === 'all' ? undefined : listState.filters.status,
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
