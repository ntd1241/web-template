import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buildListQueryParams } from '@/lib/list-query-params';
import { useTableListState } from '@/hooks/use-table-list-state';
import { useTenant } from '@/providers/tenant-provider';
import { loadEmployeeList, loadEmployeeRoleOptions, loadEmployeeTagFilter } from '../api/employees.api';
import {
  EMPLOYEE_STATUSES,
  type EmployeeListParams,
  type EmployeeRoleOption,
  type EmployeeStatus,
} from '../model/employee';

export type EmployeeAccountFilter = 'all' | 'linked' | 'unlinked';

export interface EmployeeListFilters {
  statuses: EmployeeStatus[];
  roleIds: string[];
  accountLinked: EmployeeAccountFilter;
  tagId: string;
}

export function useEmployeeList() {
  const tenantState = useTenant();
  const listState = useTableListState<EmployeeListFilters>({
    initialFilters: {
      statuses: [],
      roleIds: [],
      accountLinked: 'all',
      tagId: 'all',
    },
    initialPageSize: 10,
  });

  const queryParams = buildListQueryParams(listState, {
    filters: {
      statuses: {
        param: 'statuses',
        serialize: (value) =>
          value.length > 0 ? value.join(',') : undefined,
      },
      roleIds: {
        param: 'roleIds',
        serialize: (value) =>
          value.length > 0 ? value.join(',') : undefined,
      },
      accountLinked: {
        param: 'accountLinked',
        serialize: (value) => (value === 'all' ? undefined : value),
      },
      tagId: {
        param: 'tagId',
        omit: ['all', ''],
      },
    },
  });

  const listParams: EmployeeListParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    search:
      typeof queryParams.search === 'string' ? queryParams.search : undefined,
    statuses:
      typeof queryParams.statuses === 'string'
        ? queryParams.statuses
            .split(',')
            .filter((value): value is EmployeeStatus =>
              EMPLOYEE_STATUSES.includes(value as EmployeeStatus),
            )
        : undefined,
    roleIds:
      typeof queryParams.roleIds === 'string'
        ? queryParams.roleIds.split(',').filter(Boolean)
        : undefined,
    accountLinked:
      queryParams.accountLinked === 'linked'
        ? true
        : queryParams.accountLinked === 'unlinked'
          ? false
          : undefined,
    tagId:
      typeof queryParams.tagId === 'string' ? queryParams.tagId : undefined,
  };

  const tagOptionsQuery = useQuery({
    queryKey: ['project', 'employees', 'tag-options', tenantState.tenantId],
    queryFn: () => loadEmployeeTagFilter(tenantState.tenantId!),
    enabled: Boolean(tenantState.tenantId),
    staleTime: 5 * 60 * 1000,
  });

  const roleOptionsQuery = useQuery({
    queryKey: ['project', 'employees', 'role-options', tenantState.tenantId],
    queryFn: () => loadEmployeeRoleOptions(tenantState.tenantId!),
    enabled: Boolean(tenantState.tenantId),
    staleTime: 5 * 60 * 1000,
  });

  const listQuery = useQuery({
    queryKey: ['project', 'employees', 'list', tenantState.tenantId, listParams],
    queryFn: ({ signal }) => {
      if (!tenantState.tenantId) {
        throw new Error('Chưa xác định tenant đang hoạt động.');
      }
      return loadEmployeeList(tenantState.tenantId, listParams, signal);
    },
    enabled: Boolean(tenantState.tenantId),
    placeholderData: keepPreviousData,
  });

  return {
    ...listState,
    tenantQuery: tenantState,
    workspaceQuery: listQuery,
    employees: listQuery.data?.employees ?? [],
    total: listQuery.data?.total ?? 0,
    employeeTagOptions: tagOptionsQuery.data?.options ?? [],
    employeeTagOptionsQuery: tagOptionsQuery,
    employeeRoleOptions: roleOptionsQuery.data ?? ([] as EmployeeRoleOption[]),
    employeeRoleOptionsQuery: roleOptionsQuery,
  };
}
