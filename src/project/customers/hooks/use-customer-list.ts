import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { loadCustomerList, loadCustomerTagFilter } from '../api/customers.api';
import type { CustomerListParams } from '../model/customer';

export interface CustomerListFilters {
  tagId: string;
}

export function useCustomerList() {
  const tenantState = useTenant();
  const listState = useTableListState<CustomerListFilters>({
    initialFilters: { tagId: 'all' },
    initialPageSize: 10,
  });

  const queryParams = buildListQueryParams(listState, {
    filters: {
      tagId: { omit: ['all', ''] },
    },
  });

  const listParams: CustomerListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search:
      typeof queryParams.search === 'string' ? queryParams.search : undefined,
    tagId:
      typeof queryParams.tagId === 'string' ? queryParams.tagId : undefined,
  };

  const tagOptionsQuery = useQuery({
    queryKey: ['project', 'customers', 'tag-options', tenantState.tenantId],
    queryFn: () => loadCustomerTagFilter(tenantState.tenantId!),
    enabled: Boolean(tenantState.tenantId),
    staleTime: 5 * 60 * 1000,
  });

  const listQuery = useQuery({
    queryKey: [
      'project',
      'customers',
      'list',
      tenantState.tenantId,
      listParams,
    ],
    queryFn: ({ signal }) => {
      if (!tenantState.tenantId) {
        throw new Error('Chưa xác định tenant đang hoạt động.');
      }
      return loadCustomerList(tenantState.tenantId, listParams, signal);
    },
    enabled: Boolean(tenantState.tenantId),
    placeholderData: keepPreviousData,
  });

  return {
    ...listState,
    tenantQuery: tenantState,
    workspaceQuery: listQuery,
    customers: listQuery.data?.customers ?? [],
    total: listQuery.data?.total ?? 0,
    customerTagOptions: tagOptionsQuery.data?.options ?? [],
    customerTagOptionsQuery: tagOptionsQuery,
  };
}
