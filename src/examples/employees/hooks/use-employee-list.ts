import { useMemo, useState } from 'react';
import type { PaginationState } from '@tanstack/react-table';
import { useDebounce } from '@/hooks/use-debounce';
import { useEmployeeListQuery } from '../api/employee.queries';

/**
 * Hook gộp toàn bộ state của trang danh sách nhân viên: tìm kiếm (debounce) +
 * phân trang + query. Component chỉ tiêu thụ kết quả, không tự gọi API (docs/01 §5).
 */
export function useEmployeeList() {
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const debouncedKeyword = useDebounce(keyword, 300);

  const params = useMemo(
    () => ({
      keyword: debouncedKeyword,
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    }),
    [debouncedKeyword, pagination.pageIndex, pagination.pageSize],
  );

  const query = useEmployeeListQuery(params);

  // Đổi từ khóa thì quay về trang đầu.
  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  return {
    keyword,
    onKeywordChange: handleKeywordChange,
    pagination,
    onPaginationChange: setPagination,
    employees: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
