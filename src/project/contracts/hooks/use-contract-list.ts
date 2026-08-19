import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { loadContractList } from '../api/contracts.api';
import type { ContractListParams, ContractStatus } from '../model/contract';

export interface ContractListFilters {
  status: 'all' | ContractStatus;
}

export function useContractList() {
  const { userId } = useUser();
  const { tenantId, isPending, isError, error, refetch } = useTenant();
  const listState = useTableListState<ContractListFilters>({
    initialFilters: { status: 'all' },
    initialPageSize: 10,
  });

  const listParams: ContractListParams = {
    page: listState.pagination.pageIndex + 1,
    pageSize: listState.pagination.pageSize,
    search: listState.keyword.trim() || undefined,
    status:
      listState.filters.status === 'all' ? undefined : listState.filters.status,
  };

  const listQuery = useQuery({
    queryKey: ['project', 'contracts', 'list', userId, tenantId, listParams],
    queryFn: ({ signal }) => {
      if (!tenantId) {
        throw new Error('Chưa xác định tenant đang hoạt động.');
      }
      return loadContractList(tenantId, listParams, signal);
    },
    enabled: Boolean(tenantId),
    placeholderData: keepPreviousData,
  });

  return {
    ...listState,
    tenantQuery: {
      isPending,
      isError,
      error,
      refetch,
    },
    workspaceQuery: listQuery,
    contracts: listQuery.data?.contracts ?? [],
    total: listQuery.data?.total ?? 0,
  };
}
