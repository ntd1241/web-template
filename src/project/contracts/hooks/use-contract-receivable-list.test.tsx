import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useContractReceivableList } from './use-contract-receivable-list';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useContractReceivableList', () => {
  it('shares list state and resets to the first page when query inputs change', () => {
    const { result } = renderHook(
      () =>
        useContractReceivableList({
          tenantId: '',
          contractId: '',
          dueSoonDays: 7,
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.onPaginationChange({ pageIndex: 2, pageSize: 10 });
    });
    expect(result.current.pagination.pageIndex).toBe(2);

    act(() => {
      result.current.setKeyword('bảo trì');
    });
    expect(result.current.pagination.pageIndex).toBe(0);

    act(() => {
      result.current.onPaginationChange({ pageIndex: 1, pageSize: 10 });
      result.current.setFilter('status', 'paid');
    });
    expect(result.current.pagination.pageIndex).toBe(0);
    expect(result.current.filters.status).toBe('paid');
  });
});
