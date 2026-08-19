import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { loadProjectContext } from '@/project/api/project-context.api';
import { useQuery } from '@tanstack/react-query';
import { useUser } from './user-provider';

export interface TenantContextValue {
  tenantId: string | null;
  tenantName: string | null;
  roleNames: string[];
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { userId } = useUser();
  const tenantQuery = useQuery({
    queryKey: ['project', 'context', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadProjectContext(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId: tenantQuery.data?.tenantId ?? null,
      tenantName: tenantQuery.data?.tenantName ?? null,
      roleNames: tenantQuery.data?.roleNames ?? [],
      isPending: tenantQuery.isPending,
      isError: tenantQuery.isError,
      error: tenantQuery.error instanceof Error ? tenantQuery.error : null,
      refetch: tenantQuery.refetch,
    }),
    [
      tenantQuery.data,
      tenantQuery.error,
      tenantQuery.isError,
      tenantQuery.isPending,
      tenantQuery.refetch,
    ],
  );

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant phải được sử dụng bên trong TenantProvider.');
  }
  return context;
}
