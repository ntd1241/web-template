import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { useSupplierListQuery } from '../api/supplier.queries';

export function useSupplierList() {
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const params = useMemo(
    () => ({
      keyword,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [keyword, pagination.pageIndex, pagination.pageSize],
  );

  const query = useSupplierListQuery(params);

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return {
    keyword,
    onKeywordChange: handleKeywordChange,
    pagination,
    onPaginationChange: setPagination,
    suppliers: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
