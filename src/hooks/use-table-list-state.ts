import { useCallback, useMemo, useRef, useState } from 'react';
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from '@tanstack/react-table';

export interface UseTableListStateOptions<TFilters extends object> {
  initialFilters: TFilters;
  initialPageSize?: number;
  initialSorting?: SortingState;
}

function resolveUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === 'function'
    ? (updater as (value: T) => T)(current)
    : updater;
}

export function useTableListState<TFilters extends object>({
  initialFilters,
  initialPageSize = 10,
  initialSorting = [],
}: UseTableListStateOptions<TFilters>) {
  const initialFiltersRef = useRef(initialFilters);
  const [keyword, setKeywordState] = useState('');
  const [filters, setFiltersState] = useState<TFilters>(initialFilters);
  const [sorting, setSortingState] = useState<SortingState>(initialSorting);
  const [pagination, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const resetPage = useCallback(() => {
    setPaginationState((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    );
  }, []);

  const setKeyword = useCallback(
    (value: string) => {
      setKeywordState(value);
      resetPage();
    },
    [resetPage],
  );

  const setFilters = useCallback(
    (updater: Updater<TFilters>) => {
      setFiltersState((current) => resolveUpdater(updater, current));
      resetPage();
    },
    [resetPage],
  );

  const setFilter = useCallback(
    <TKey extends keyof TFilters>(key: TKey, value: TFilters[TKey]) => {
      setFiltersState((current) => ({ ...current, [key]: value }));
      resetPage();
    },
    [resetPage],
  );

  const setSorting = useCallback(
    (updater: Updater<SortingState>) => {
      setSortingState((current) => resolveUpdater(updater, current));
      resetPage();
    },
    [resetPage],
  );

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      setPaginationState((current) => {
        const next = resolveUpdater(updater, current);
        return next.pageSize !== current.pageSize
          ? { ...next, pageIndex: 0 }
          : next;
      });
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFiltersState(initialFiltersRef.current);
    resetPage();
  }, [resetPage]);

  const resetAll = useCallback(() => {
    setKeywordState('');
    setFiltersState(initialFiltersRef.current);
    setSortingState(initialSorting);
    setPaginationState((current) => ({ ...current, pageIndex: 0 }));
  }, [initialSorting]);

  return useMemo(
    () => ({
      keyword,
      setKeyword,
      filters,
      setFilters,
      setFilter,
      sorting,
      setSorting,
      pagination,
      onPaginationChange,
      resetFilters,
      resetAll,
    }),
    [
      filters,
      keyword,
      onPaginationChange,
      pagination,
      resetAll,
      resetFilters,
      setFilter,
      setFilters,
      setKeyword,
      setSorting,
      sorting,
    ],
  );
}
