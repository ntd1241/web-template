import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { selectTableList } from '@/lib/table-list';
import { useTableListState } from '@/hooks/use-table-list-state';
import { loadContractWorkspace } from '../api/contracts.api';
import type { Contract, ContractStatus } from '../model/contract';

export interface ContractListFilters {
  status: 'all' | ContractStatus;
}

const EMPTY_CONTRACTS: Contract[] = [];

function matchesContract(
  contract: Contract,
  keyword: string,
  filters: ContractListFilters,
) {
  if (filters.status !== 'all' && contract.status !== filters.status) {
    return false;
  }

  const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi-VN');
  if (!normalizedKeyword) return true;

  return [
    contract.contractCode,
    contract.name,
    contract.customerName,
    contract.customerCode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('vi-VN')
    .includes(normalizedKeyword);
}

export function useContractList(userId: string | null) {
  const listState = useTableListState<ContractListFilters>({
    initialFilters: { status: 'all' },
    initialPageSize: 10,
  });

  const workspaceQuery = useQuery({
    queryKey: ['project', 'contracts', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadContractWorkspace(userId);
    },
    enabled: Boolean(userId),
  });

  const selection = useMemo(
    () =>
      selectTableList({
        data: workspaceQuery.data?.contracts ?? EMPTY_CONTRACTS,
        keyword: listState.keyword,
        filters: listState.filters,
        pagination: listState.pagination,
        sorting: listState.sorting,
        matches: matchesContract,
      }),
    [
      listState.filters,
      listState.keyword,
      listState.pagination,
      listState.sorting,
      workspaceQuery.data?.contracts,
    ],
  );

  return {
    ...listState,
    workspaceQuery,
    contracts: selection.items,
    total: selection.total,
  };
}
