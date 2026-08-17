import type { PaginationState, SortingState } from '@tanstack/react-table';
import { selectTableList } from './table-list';

interface Row {
  id: string;
  name: string;
  status: 'active' | 'draft';
}

interface Filters {
  status: 'all' | Row['status'];
}

const rows: Row[] = [
  { id: '1', name: 'Alpha', status: 'active' },
  { id: '2', name: 'Beta', status: 'draft' },
  { id: '3', name: 'Gamma', status: 'active' },
];

const pagination: PaginationState = { pageIndex: 0, pageSize: 10 };

describe('selectTableList', () => {
  it('filters and returns the filtered total', () => {
    const result = selectTableList({
      data: rows,
      keyword: 'a',
      filters: { status: 'active' } satisfies Filters,
      pagination,
      matches: (row, keyword, filters) =>
        row.name.toLowerCase().includes(keyword.toLowerCase()) &&
        (filters.status === 'all' || row.status === filters.status),
    });

    expect(result.items.map((row) => row.id)).toEqual(['1', '3']);
    expect(result.total).toBe(2);
  });

  it('sorts before paginating without mutating the source array', () => {
    const sorting: SortingState = [{ id: 'name', desc: true }];
    const result = selectTableList({
      data: rows,
      keyword: '',
      filters: { status: 'all' } satisfies Filters,
      pagination: { pageIndex: 0, pageSize: 2 },
      sorting,
      compare: (left, right) => right.name.localeCompare(left.name),
    });

    expect(result.items.map((row) => row.name)).toEqual(['Gamma', 'Beta']);
    expect(rows.map((row) => row.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('returns the requested page after filtering', () => {
    const result = selectTableList({
      data: rows,
      keyword: '',
      filters: { status: 'all' } satisfies Filters,
      pagination: { pageIndex: 1, pageSize: 2 },
    });

    expect(result.items.map((row) => row.id)).toEqual(['3']);
    expect(result.total).toBe(3);
  });
});
