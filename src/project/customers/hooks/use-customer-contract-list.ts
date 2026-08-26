import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { loadContractList } from '../../contracts/api/contracts.api';
import type { ContractListParams } from '../../contracts/model/contract';

type CustomerContractListFilters = Record<never, never>;

export function useCustomerContractList(customerId: string) {
  const tenantQuery = useTenant();
  const listState = useTableListState<CustomerContractListFilters>({
    initialFilters: {},
    initialPageSize: 10,
  });
  const queryParams = buildListQueryParams(listState);
  const listParams: ContractListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    customerId,
  };

  const listQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'customer',
      tenantQuery.tenantId,
      customerId,
      listParams,
    ],
    queryFn: ({ signal }) => {
      if (!tenantQuery.tenantId) {
        throw new Error('Chưa xác định tenant đang hoạt động.');
      }
      return loadContractList(tenantQuery.tenantId, listParams, signal);
    },
    enabled: Boolean(tenantQuery.tenantId && customerId),
    placeholderData: keepPreviousData,
  });

  return {
    ...listState,
    tenantQuery,
    workspaceQuery: listQuery,
    contracts: listQuery.data?.contracts ?? [],
    total: listQuery.data?.total ?? 0,
  };
}
