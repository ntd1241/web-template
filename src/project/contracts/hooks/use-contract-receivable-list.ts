import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTableListState } from '@/hooks/use-table-list-state';
import { loadContractReceivablePeriodList } from '../api/contracts.api';
import {
  type ContractChargeDisplayStatus,
  type ContractReceivablePeriodListParams,
  type ContractReceivableSortOption,
} from '../model/receivable';

export interface ContractReceivableListFilters {
  status: 'all' | ContractChargeDisplayStatus;
  sort: ContractReceivableSortOption;
}

const INITIAL_FILTERS: ContractReceivableListFilters = {
  status: 'all',
  sort: 'periodStart_desc',
};

export function useContractReceivableList({
  tenantId,
  contractId,
  dueSoonDays,
}: {
  tenantId: string;
  contractId: string;
  dueSoonDays: number;
}) {
  const listState = useTableListState<ContractReceivableListFilters>({
    initialFilters: INITIAL_FILTERS,
    initialPageSize: 10,
  });
  const listParams: ContractReceivablePeriodListParams = {
    page: listState.pagination.pageIndex + 1,
    pageSize: listState.pagination.pageSize,
    search: listState.keyword.trim() || undefined,
    status:
      listState.filters.status === 'all' ? undefined : listState.filters.status,
    sort: listState.filters.sort,
    dueSoonDays,
  };
  const listQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'receivable-periods',
      tenantId,
      contractId,
      listParams,
    ],
    queryFn: ({ signal }) =>
      loadContractReceivablePeriodList(
        tenantId,
        contractId,
        listParams,
        signal,
      ),
    enabled: Boolean(tenantId && contractId),
    placeholderData: keepPreviousData,
    retry: false,
  });

  return {
    ...listState,
    listQuery,
    rows: listQuery.data?.rows ?? [],
    visibleRows: listQuery.data?.rows ?? [],
    total: listQuery.data?.total ?? 0,
  };
}
