import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { loadCustomerList, loadCustomerTagFilter } from '../api/customers.api';
import {
  BUSINESS_TYPES,
  CUSTOMER_STATUSES,
  type BusinessType,
  type CustomerListParams,
  type CustomerStatus,
} from '../model/customer';

export interface CustomerListFilters {
  customerSearch: string;
  businessTypes: BusinessType[];
  contactSearch: string;
  statuses: CustomerStatus[];
  tagId: string;
}

export function useCustomerList() {
  const tenantState = useTenant();
  const listState = useTableListState<CustomerListFilters>({
    initialFilters: {
      customerSearch: '',
      businessTypes: [],
      contactSearch: '',
      statuses: [],
      tagId: 'all',
    },
    initialPageSize: 10,
  });

  const queryParams = buildListQueryParams(listState, {
    filters: {
      customerSearch: { omit: [''] },
      businessTypes: {
        param: 'businessTypes',
        serialize: (value) => (value.length > 0 ? value.join(',') : undefined),
      },
      contactSearch: { omit: [''] },
      statuses: {
        param: 'statuses',
        serialize: (value) => (value.length > 0 ? value.join(',') : undefined),
      },
      tagId: { omit: ['all', ''] },
    },
  });

  const listParams: CustomerListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search:
      typeof queryParams.search === 'string' ? queryParams.search : undefined,
    customerSearch:
      typeof queryParams.customerSearch === 'string'
        ? queryParams.customerSearch
        : undefined,
    businessTypes:
      typeof queryParams.businessTypes === 'string'
        ? queryParams.businessTypes
            .split(',')
            .filter((value): value is BusinessType =>
              BUSINESS_TYPES.includes(value as BusinessType),
            )
        : undefined,
    contactSearch:
      typeof queryParams.contactSearch === 'string'
        ? queryParams.contactSearch
        : undefined,
    statuses:
      typeof queryParams.statuses === 'string'
        ? queryParams.statuses
            .split(',')
            .filter((value): value is CustomerStatus =>
              CUSTOMER_STATUSES.includes(value as CustomerStatus),
            )
        : undefined,
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
