import { useSubjectTagFilter } from '@/project/tags/hooks/use-subject-tag-filter';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import {
  loadCustomerList,
  loadCustomerStatusStats,
} from '../api/customers.api';
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
  tagIds: string[];
}

export function useCustomerList() {
  const tenantState = useTenant();
  const listState = useTableListState<CustomerListFilters>({
    initialFilters: {
      customerSearch: '',
      businessTypes: [],
      contactSearch: '',
      statuses: [],
      tagIds: [],
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
      tagIds: {
        param: 'tagIds',
        serialize: (value) => (value.length > 0 ? value.join(',') : undefined),
      },
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
    tagIds:
      typeof queryParams.tagIds === 'string'
        ? queryParams.tagIds.split(',').filter(Boolean)
        : undefined,
  };

  const subjectTagFilterQuery = useSubjectTagFilter('customer', {
    moduleCodes: ['customers'],
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

  const statusStatsQuery = useQuery({
    queryKey: ['project', 'customers', 'stats', tenantState.tenantId],
    queryFn: ({ signal }) =>
      loadCustomerStatusStats(tenantState.tenantId!, signal),
    enabled: Boolean(tenantState.tenantId),
  });

  return {
    ...listState,
    tenantQuery: tenantState,
    workspaceQuery: listQuery,
    statusStatsQuery,
    customers: listQuery.data?.customers ?? [],
    total: listQuery.data?.total ?? 0,
    customerTagOptions: subjectTagFilterQuery.data?.options ?? [],
    customerTagsByCustomerId: subjectTagFilterQuery.data?.tagsBySubjectId ?? {},
    customerTagOptionsQuery: subjectTagFilterQuery,
  };
}
