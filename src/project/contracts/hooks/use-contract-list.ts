import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { loadCurrentTenantSettings } from '../../api/tenant-settings.api';
import { loadCustomerSelectOptions } from '../../customers/api/customers.api';
import {
  DEFAULT_CONTRACT_RENEWAL_REMINDER_DAYS,
  DEFAULT_PAYMENT_REMINDER_DAYS,
} from '../../model/tenant-settings';
import {
  loadContractList,
  loadContractStatusStats,
} from '../api/contracts.api';
import {
  CONTRACT_LIST_INITIAL_FILTERS,
  CONTRACT_STATUSES,
  type ContractListFilters,
  type ContractListParams,
  type ContractStatus,
} from '../model/contract';

export function useContractList() {
  const { userId } = useUser();
  const { tenantId, isPending, isError, error, refetch } = useTenant();
  const listState = useTableListState<ContractListFilters>({
    initialFilters: CONTRACT_LIST_INITIAL_FILTERS,
    initialPageSize: 10,
  });

  const queryParams = buildListQueryParams(listState, {
    filters: {
      status: {
        param: 'statuses',
        serialize: (value) => (value.length > 0 ? value.join(',') : undefined),
      },
      contractSearch: { omit: [''] },
      customerId: { omit: [''] },
      outstandingMin: {},
      outstandingMax: {},
      nextDueFrom: {},
      nextDueTo: {},
    },
  });
  const listParams: ContractListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search:
      typeof queryParams.search === 'string' ? queryParams.search : undefined,
    contractSearch:
      typeof queryParams.contractSearch === 'string'
        ? queryParams.contractSearch
        : undefined,
    statuses:
      typeof queryParams.statuses === 'string'
        ? queryParams.statuses
            .split(',')
            .filter((value): value is ContractStatus =>
              CONTRACT_STATUSES.includes(value as ContractStatus),
            )
        : undefined,
    customerId:
      typeof queryParams.customerId === 'string'
        ? queryParams.customerId
        : undefined,
    outstandingMin:
      typeof queryParams.outstandingMin === 'number'
        ? queryParams.outstandingMin
        : undefined,
    outstandingMax:
      typeof queryParams.outstandingMax === 'number'
        ? queryParams.outstandingMax
        : undefined,
    nextDueFrom:
      typeof queryParams.nextDueFrom === 'string'
        ? queryParams.nextDueFrom
        : undefined,
    nextDueTo:
      typeof queryParams.nextDueTo === 'string'
        ? queryParams.nextDueTo
        : undefined,
  };

  const tenantSettingsQuery = useQuery({
    queryKey: ['project', 'tenant-settings', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadCurrentTenantSettings(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId),
    staleTime: 5 * 60 * 1000,
  });

  const customerOptionsQuery = useQuery({
    queryKey: ['project', 'customers', 'select-options', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadCustomerSelectOptions(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId),
    staleTime: 5 * 60 * 1000,
  });

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

  const statusStatsQuery = useQuery({
    queryKey: ['project', 'contracts', 'stats', userId, tenantId],
    queryFn: ({ signal }) => {
      if (!tenantId) {
        throw new Error('Chưa xác định tenant đang hoạt động.');
      }
      return loadContractStatusStats({ tenantId }, signal);
    },
    enabled: Boolean(tenantId),
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
    statusStatsQuery,
    tenantSettingsQuery,
    paymentReminderDays:
      tenantSettingsQuery.data?.values.paymentReminderDays ??
      DEFAULT_PAYMENT_REMINDER_DAYS,
    contractRenewalReminderDays:
      tenantSettingsQuery.data?.values.contractRenewalReminderDays ??
      DEFAULT_CONTRACT_RENEWAL_REMINDER_DAYS,
    contracts: listQuery.data?.contracts ?? [],
    total: listQuery.data?.total ?? 0,
    customerOptionsQuery,
    customerOptions: customerOptionsQuery.data ?? [],
  };
}
