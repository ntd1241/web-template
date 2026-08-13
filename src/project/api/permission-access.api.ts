import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';

export interface EffectivePermissionRow {
  permission_code: string;
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

export async function getEffectivePermissionCodes(
  tenantId: string,
  userId?: string,
): Promise<string[]> {
  assertSupabaseConfigured();

  const rows = await request<EffectivePermissionRow[]>(
    supabaseApi.post('/rpc/get_effective_permissions', {
      target_tenant_id: tenantId,
      ...(userId ? { target_user_id: userId } : {}),
    }),
  );

  return rows.map((row) => row.permission_code);
}

export async function hasTenantPermission(
  tenantId: string,
  permissionCode: string,
  userId?: string,
): Promise<boolean> {
  assertSupabaseConfigured();

  return request<boolean>(
    supabaseApi.post('/rpc/has_tenant_permission', {
      target_tenant_id: tenantId,
      required_permission_code: permissionCode,
      ...(userId ? { target_user_id: userId } : {}),
    }),
  );
}
