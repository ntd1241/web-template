import type { PaginationState, SortingState } from '@tanstack/react-table';

export interface TableListSelectionOptions<TItem, TFilters extends object> {
  data: readonly TItem[];
  keyword: string;
  filters: TFilters;
  pagination: PaginationState;
  sorting?: SortingState;
  matches?: (item: TItem, keyword: string, filters: TFilters) => boolean;
  compare?: (left: TItem, right: TItem, sorting: SortingState) => number;
}

export interface TableListSelectionResult<TItem> {
  items: TItem[];
  total: number;
}

/**
 * Selects the current page from an in-memory list.
 *
 * The same return shape can be used by a future server-side query hook, where
 * `items` and `total` come directly from the API response.
 */
export function selectTableList<TItem, TFilters extends object>({
  data,
  keyword,
  filters,
  pagination,
  sorting = [],
  matches,
  compare,
}: TableListSelectionOptions<
  TItem,
  TFilters
>): TableListSelectionResult<TItem> {
  const filtered = matches
    ? data.filter((item) => matches(item, keyword, filters))
    : [...data];

  const sorted =
    compare && sorting.length
      ? [...filtered].sort((left, right) => compare(left, right, sorting))
      : filtered;
  const start = pagination.pageIndex * pagination.pageSize;

  return {
    items: sorted.slice(start, start + pagination.pageSize),
    total: sorted.length,
  };
}
