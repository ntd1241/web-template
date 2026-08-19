import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { getEffectivePermissionCodes } from '@/project/api/permission-access.api';
import { loadProjectContext } from '@/project/api/project-context.api';
import { useAuthStore } from '@/stores/auth.store';
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
  const setPermissions = useAuthStore((state) => state.setPermissions);
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
  const tenantId = tenantQuery.data?.tenantId ?? null;
  const permissionQuery = useQuery({
    queryKey: ['project', 'effective-permissions', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tài khoản hoặc tenant.');
      }
      return getEffectivePermissionCodes(tenantId, userId);
    },
    enabled: Boolean(userId && tenantId),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (permissionQuery.data) {
      setPermissions(permissionQuery.data);
    }
  }, [permissionQuery.data, setPermissions]);

  const value = useMemo<TenantContextValue>(
    () => ({
      tenantId,
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
      tenantId,
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
