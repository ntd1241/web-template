import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
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

  const queryParams = buildListQueryParams(listState, {
    filters: {
      status: { omit: ['all'] },
    },
  });
  const listParams: ContractListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search:
      typeof queryParams.search === 'string' ? queryParams.search : undefined,
    status:
      typeof queryParams.status === 'string'
        ? (queryParams.status as ContractStatus)
        : undefined,
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
