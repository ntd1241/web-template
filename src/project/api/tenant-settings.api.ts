import { env } from '@/config/env';
import {
  assertSupabaseConfigured,
  supabaseApi,
  supabaseStorageApi,
} from '@/lib/supabase';
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
          paymentReminderDays: values.paymentReminderDays,
        },
      },
      {
        ...queryParams({ id: `eq.${tenantId}` }),
        headers: { Prefer: 'return=minimal' },
      },
    ),
  );
}

const TENANT_ASSETS_BUCKET = 'tenant-assets';

function fileExtension(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;

  return file.type === 'image/png'
    ? 'png'
    : file.type === 'image/webp'
      ? 'webp'
      : 'jpg';
}

export async function uploadTenantLogo(
  tenantId: string,
  file: File,
): Promise<string> {
  assertSupabaseConfigured();

  const path = `${tenantId}/logo.${fileExtension(file)}`;
  await request<unknown>(
    supabaseStorageApi.post(`/object/${TENANT_ASSETS_BUCKET}/${path}`, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
    }),
  );

  return `${env.supabaseUrl}/storage/v1/object/public/${TENANT_ASSETS_BUCKET}/${path}`;
}
