import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type {
  SavedViewConfig,
  SavedViewResource,
  TenantSavedView,
} from '../model/saved-view';

interface TenantSavedViewRow {
  id: string;
  tenant_id: string;
  resource: SavedViewResource;
  name: string;
  config: Record<string, unknown>;
  is_default: boolean;
  version: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

function mapSavedView<TFilters extends object>(
  row: TenantSavedViewRow,
): TenantSavedView<TFilters> {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    resource: row.resource,
    name: row.name,
    config: row.config as unknown as SavedViewConfig<TFilters>,
    isDefault: row.is_default,
    version: row.version,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadTenantSavedViews<TFilters extends object>(
  tenantId: string,
  resource: SavedViewResource,
  signal?: AbortSignal,
): Promise<TenantSavedView<TFilters>[]> {
  assertSupabaseConfigured();

  const rows = await request<TenantSavedViewRow[]>(
    supabaseApi.get('/tenant_saved_views', {
      ...queryParams({
        select:
          'id,tenant_id,resource,name,config,is_default,version,created_by,updated_by,created_at,updated_at',
        tenant_id: `eq.${tenantId}`,
        resource: `eq.${resource}`,
        order: 'is_default.desc,created_at.asc,name.asc',
      }),
      signal,
    }),
  );

  return rows.map((row) => mapSavedView<TFilters>(row));
}

export async function createTenantSavedView<TFilters extends object>(
  tenantId: string,
  userId: string,
  resource: SavedViewResource,
  name: string,
  config: SavedViewConfig<TFilters>,
): Promise<TenantSavedView<TFilters>> {
  assertSupabaseConfigured();

  const rows = await request<TenantSavedViewRow[]>(
    supabaseApi.post(
      '/tenant_saved_views',
      {
        tenant_id: tenantId,
        resource,
        name: name.trim(),
        config,
        created_by: userId,
        updated_by: userId,
      },
      {
        headers: { Prefer: 'return=representation' },
      },
    ),
  );
  if (!rows[0]) throw new Error('Không thể tạo chế độ xem.');

  return mapSavedView<TFilters>(rows[0]);
}

export async function updateTenantSavedView<TFilters extends object>(
  tenantId: string,
  userId: string,
  view: TenantSavedView<TFilters>,
  name: string,
  config: SavedViewConfig<TFilters>,
): Promise<TenantSavedView<TFilters>> {
  assertSupabaseConfigured();

  const rows = await request<TenantSavedViewRow[]>(
    supabaseApi.patch(
      '/tenant_saved_views',
      {
        name: name.trim(),
        config,
        version: view.version + 1,
        updated_by: userId,
      },
      {
        ...queryParams({
          id: `eq.${view.id}`,
          tenant_id: `eq.${tenantId}`,
          version: `eq.${view.version}`,
        }),
        headers: { Prefer: 'return=representation' },
      },
    ),
  );
  if (!rows[0]) {
    throw new Error(
      'Chế độ xem đã được cập nhật bởi tài khoản khác. Vui lòng tải lại trang.',
    );
  }

  return mapSavedView<TFilters>(rows[0]);
}

export async function deleteTenantSavedView(
  tenantId: string,
  viewId: string,
): Promise<void> {
  assertSupabaseConfigured();
  await supabaseApi.delete(
    '/tenant_saved_views',
    queryParams({ id: `eq.${viewId}`, tenant_id: `eq.${tenantId}` }),
  );
}
