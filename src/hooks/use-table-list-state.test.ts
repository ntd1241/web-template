import { act, renderHook } from '@testing-library/react';
import { useTableListState } from './use-table-list-state';

interface Filters {
  status: 'all' | 'active';
}

describe('useTableListState', () => {
  const options = {
    initialFilters: { status: 'all' } as Filters,
    initialPageSize: 10,
  };

  it('resets to the first page when keyword or filter changes', () => {
    const { result } = renderHook(() => useTableListState(options));

    act(() => {
      result.current.onPaginationChange({ pageIndex: 2, pageSize: 10 });
      result.current.setKeyword('ABC');
    });

    expect(result.current.pagination.pageIndex).toBe(0);

    act(() => {
      result.current.onPaginationChange({ pageIndex: 1, pageSize: 10 });
      result.current.setFilter('status', 'active');
    });

    expect(result.current.filters.status).toBe('active');
    expect(result.current.pagination.pageIndex).toBe(0);
  });

  it('resets when page size or sorting changes', () => {
    const { result } = renderHook(() => useTableListState(options));

    act(() => {
      result.current.onPaginationChange({ pageIndex: 3, pageSize: 25 });
    });
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 25 });

    act(() => {
      result.current.onPaginationChange({ pageIndex: 2, pageSize: 25 });
      result.current.setSorting([{ id: 'createdAt', desc: true }]);
    });

    expect(result.current.sorting).toEqual([{ id: 'createdAt', desc: true }]);
    expect(result.current.pagination.pageIndex).toBe(0);
  });
});
