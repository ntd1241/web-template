/**
 * Query key factory cho React Query — pattern nhất quán để invalidate đúng phạm vi.
 *
 * Mỗi feature mở rộng theo mẫu này, ví dụ:
 *   export const employeeKeys = {
 *     all: ['employees'] as const,
 *     lists: () => [...employeeKeys.all, 'list'] as const,
 *     list: (params) => [...employeeKeys.lists(), params] as const,
 *     detail: (id) => [...employeeKeys.all, 'detail', id] as const,
 *   };
 */
export function createQueryKeys<TParams = unknown>(scope: string) {
  const all = [scope] as const;
  return {
    all,
    lists: () => [...all, 'list'] as const,
    list: (params: TParams) => [...all, 'list', params] as const,
    details: () => [...all, 'detail'] as const,
    detail: (id: string) => [...all, 'detail', id] as const,
  };
}
