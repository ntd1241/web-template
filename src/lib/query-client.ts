import { QueryClient } from '@tanstack/react-query';

/**
 * QueryClient dùng chung. Mặc định hợp lý cho admin app:
 * không refetch khi focus, retry 1 lần, staleTime 1 phút.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
