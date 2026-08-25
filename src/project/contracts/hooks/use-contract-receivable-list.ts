import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { loadContractReceivablePeriodList } from '../api/contracts.api';
import {
  type ContractChargeDisplayStatus,
  type ContractReceivablePeriodListParams,
  type ContractReceivableSortOption,
  type ContractReceivableViewMode,
} from '../model/receivable';

export interface ContractReceivableListFilters {
  status: 'all' | ContractChargeDisplayStatus;
  sort: ContractReceivableSortOption;
  view: ContractReceivableViewMode;
  year: number;
}

const INITIAL_FILTERS: ContractReceivableListFilters = {
  status: 'all',
  sort: 'periodStart_desc',
  view: 'month',
  year: new Date().getFullYear(),
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
  const queryParams = buildListQueryParams(listState, {
    filters: {
      status: { omit: ['all'] },
      sort: {},
      view: {},
      year: {},
    },
  });
  const listParams: ContractReceivablePeriodListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search:
      typeof queryParams.search === 'string' ? queryParams.search : undefined,
    status:
      typeof queryParams.status === 'string'
        ? (queryParams.status as ContractChargeDisplayStatus)
        : undefined,
    sort: queryParams.sort as ContractReceivableSortOption,
    view: queryParams.view as ContractReceivableViewMode,
    dueSoonDays,
    year: Number(queryParams.year),
  };
  const listQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'receivable-plan',
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
