import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTableListState } from '@/hooks/use-table-list-state';
import { loadProjectContext } from '../../api/project-context.api';
import { loadContractList } from '../api/contracts.api';
import type { ContractListParams, ContractStatus } from '../model/contract';

export interface ContractListFilters {
  status: 'all' | ContractStatus;
}

export function useContractList(userId: string | null) {
  const listState = useTableListState<ContractListFilters>({
    initialFilters: { status: 'all' },
    initialPageSize: 10,
  });

  const contextQuery = useQuery({
    queryKey: ['project', 'context', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadProjectContext(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  const listParams: ContractListParams = {
    page: listState.pagination.pageIndex + 1,
    pageSize: listState.pagination.pageSize,
    search: listState.keyword.trim() || undefined,
    status:
      listState.filters.status === 'all' ? undefined : listState.filters.status,
  };

  const listQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'list',
      userId,
      contextQuery.data?.tenantId,
      listParams,
    ],
    queryFn: ({ signal }) => {
      if (!contextQuery.data?.tenantId) {
        throw new Error('Chưa xác định tenant đang hoạt động.');
      }
      return loadContractList(contextQuery.data.tenantId, listParams, signal);
    },
    enabled: Boolean(contextQuery.data?.tenantId),
    placeholderData: keepPreviousData,
  });

  return {
    ...listState,
    contextQuery,
    workspaceQuery: listQuery,
    contracts: listQuery.data?.contracts ?? [],
    total: listQuery.data?.total ?? 0,
  };
}
