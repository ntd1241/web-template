import type { PaginationState, SortingState } from '@tanstack/react-table';

export interface ListQueryState<TFilters extends object> {
  keyword: string;
  filters: TFilters;
  pagination: PaginationState;
  sorting?: SortingState;
}

export interface ListQueryFilterSpec<TValue> {
  param?: string;
  omit?: readonly unknown[];
  serialize?: (value: TValue) => unknown;
}

export interface ListQueryParamsSpec<TFilters extends object> {
  search?: { param?: string };
  filters?: Partial<{
    [TKey in keyof TFilters]: ListQueryFilterSpec<TFilters[TKey]>;
  }>;
  sort?: {
    param?: string;
    serialize?: (sorting: SortingState) => unknown;
  };
}

export type ListQueryParams = Record<string, unknown> & {
  page: number;
  pageSize: number;
};

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function isOmitted(value: unknown, omit: readonly unknown[] | undefined) {
  return omit?.some((omittedValue) => Object.is(omittedValue, value)) ?? false;
}

export function serializeSingleSorting(
  sorting: SortingState,
): string | undefined {
  const item = sorting[0];
  return item ? `${item.id}_${item.desc ? 'desc' : 'asc'}` : undefined;
}

export function buildListQueryParams<TFilters extends object>(
  state: ListQueryState<TFilters>,
  spec: ListQueryParamsSpec<TFilters> = {},
): ListQueryParams {
  const params: ListQueryParams = {
    page: state.pagination.pageIndex + 1,
    pageSize: state.pagination.pageSize,
  };

  const keyword = state.keyword.trim();
  if (keyword) params[spec.search?.param ?? 'search'] = keyword;

  for (const key of Object.keys(state.filters) as Array<keyof TFilters>) {
    const value = state.filters[key];
    const filterSpec = spec.filters?.[key];

    if (!filterSpec || !hasValue(value) || isOmitted(value, filterSpec.omit)) {
      continue;
    }

    const serialized = filterSpec.serialize
      ? filterSpec.serialize(value)
      : value;
    if (hasValue(serialized)) {
      params[filterSpec.param ?? String(key)] = serialized;
    }
  }

  const serializedSort = spec.sort?.serialize
    ? spec.sort.serialize(state.sorting ?? [])
    : serializeSingleSorting(state.sorting ?? []);
  if (hasValue(serializedSort)) {
    params[spec.sort?.param ?? 'sort'] = serializedSort;
  }

  return params;
}
