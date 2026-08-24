import type { SortingState } from '@tanstack/react-table';
import {
  buildListQueryParams,
  serializeSingleSorting,
} from './list-query-params';

interface Filters {
  status: 'all' | 'active';
  tagId: string;
  customerCode: string;
}

describe('buildListQueryParams', () => {
  it('normalizes pagination, search, filters, and sorting', () => {
    const result = buildListQueryParams<Filters>(
      {
        keyword: '  abc  ',
        filters: { status: 'active', tagId: 'all', customerCode: 'KH-001' },
        pagination: { pageIndex: 2, pageSize: 25 },
        sorting: [{ id: 'createdAt', desc: true }],
      },
      {
        filters: {
          status: { param: 'p_status', omit: ['all'] },
          tagId: { param: 'p_tag_id', omit: ['all'] },
          customerCode: { param: 'p_customer_code' },
        },
        search: { param: 'p_search' },
        sort: { param: 'p_sort' },
      },
    );

    expect(result).toEqual({
      page: 3,
      pageSize: 25,
      p_search: 'abc',
      p_status: 'active',
      p_customer_code: 'KH-001',
      p_sort: 'createdAt_desc',
    });
  });

  it('supports custom serializers and omits empty values', () => {
    const result = buildListQueryParams(
      {
        keyword: '',
        filters: { value: '' },
        pagination: { pageIndex: 0, pageSize: 10 },
      },
      {
        filters: {
          value: {
            serialize: (value) => value.toUpperCase(),
          },
        },
      },
    );

    expect(result).toEqual({ page: 1, pageSize: 10 });
  });
});

describe('serializeSingleSorting', () => {
  it('serializes the first sorting rule', () => {
    const sorting: SortingState = [{ id: 'name', desc: false }];
    expect(serializeSingleSorting(sorting)).toBe('name_asc');
    expect(serializeSingleSorting([])).toBeUndefined();
  });
});
