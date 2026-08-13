import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import {
  mapTenantSettingsRow,
  type TenantSettingsRow,
  type TenantSettingsValues,
} from '../model/tenant-settings';

interface TenantMembershipRow {
  tenant_id: string;
}

export interface CurrentTenantSettings {
  tenantId: string;
  values: TenantSettingsValues;
  settings: Record<string, unknown>;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

async function getCurrentTenantId(userId: string) {
  const memberships = await request<TenantMembershipRow[]>(
    supabaseApi.get(
      '/tenant_members',
      queryParams({
        select: 'tenant_id',
        user_id: `eq.${userId}`,
        status: 'eq.active',
        order: 'created_at.asc',
        limit: '1',
      }),
    ),
  );
  const tenantId = memberships[0]?.tenant_id;

  if (!tenantId) {
    throw new Error('Tài khoản chưa thuộc tenant đang hoạt động.');
  }

  return tenantId;
}

export async function loadCurrentTenantSettings(
  userId: string,
): Promise<CurrentTenantSettings> {
  assertSupabaseConfigured();

  const tenantId = await getCurrentTenantId(userId);
  const rows = await request<TenantSettingsRow[]>(
    supabaseApi.get(
      '/tenants',
      queryParams({
        select: 'id,name,legal_name,logo_url,settings',
        id: `eq.${tenantId}`,
        limit: '1',
      }),
    ),
  );
  const tenant = rows[0];

  if (!tenant) {
    throw new Error('Không tìm thấy thông tin tenant.');
  }

  return {
    tenantId,
    values: mapTenantSettingsRow(tenant),
    settings: tenant.settings,
  };
}

export async function updateTenantSettings(
  tenantId: string,
  values: TenantSettingsValues,
  currentSettings: Record<string, unknown> = {},
): Promise<void> {
  assertSupabaseConfigured();

  await request<void>(
    supabaseApi.patch(
      '/tenants',
      {
        name: values.name,
        legal_name: values.legalName || null,
        logo_url: values.logoUrl || null,
        settings: {
          ...currentSettings,
          description: values.description,
          address: values.address,
          email: values.email,
          phone: values.phone,
          taxCode: values.taxCode,
          website: values.website,
        },
      },
      {
        ...queryParams({ id: `eq.${tenantId}` }),
        headers: { Prefer: 'return=minimal' },
      },
    ),
  );
}
