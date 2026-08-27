import {
  getPublicStorageUrl,
  TENANT_ASSETS_BUCKET,
  uploadStorageObject,
} from '@/lib/storage';
import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type {
  Customer,
  CustomerFormValues,
  CustomerListParams,
  CustomerListResult,
  CustomerListRpcRow,
  CustomerRow,
  CustomerStatus,
} from '../model/customer';
import { mapCustomerRow } from '../model/customer';

interface TenantMembershipRow {
  tenant_id: string;
}

interface RegionRow {
  code: string;
  name: string;
}

interface CustomerListRpcResponse {
  items: CustomerListRpcRow[];
  total: number | string;
}

export interface CustomerStatusStats {
  total: number;
  active: number;
  inactive: number;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

function numberValue(value: number | string | null | undefined) {
  return value == null ? 0 : typeof value === 'number' ? value : Number(value);
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

async function resolveTenantId(userId: string) {
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
  if (!tenantId) throw new Error('Tài khoản chưa thuộc tenant đang hoạt động.');
  return tenantId;
}

export interface CustomerWorkspace {
  tenantId: string;
  customers: Customer[];
}

export type CustomerSelectOption = Pick<
  Customer,
  'id' | 'customerCode' | 'name' | 'imageUrl'
>;

interface CustomerSelectRow {
  id: string;
  customer_code: string;
  name: string;
  image_url: string | null;
}

export async function loadCustomerSelectOptions(
  userId: string,
  tenantIdOverride?: string,
): Promise<CustomerSelectOption[]> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const rows = await request<CustomerSelectRow[]>(
    supabaseApi.get(
      '/customers',
      queryParams({
        select: 'id,customer_code,name,image_url',
        tenant_id: `eq.${tenantId}`,
        status: 'eq.active',
        order: 'name.asc',
      }),
    ),
  );

  return rows.map((row) => ({
    id: row.id,
    customerCode: row.customer_code,
    name: row.name,
    imageUrl: row.image_url,
  }));
}

export async function loadCustomerRegionOptions() {
  assertSupabaseConfigured();
  const rows = await request<RegionRow[]>(
    supabaseApi.get(
      '/regions',
      queryParams({
        select: 'code,name',
        country_code: 'eq.VN',
        level: 'eq.province',
        is_active: 'eq.true',
        order: 'name.asc',
      }),
    ),
  );

  return rows.map((row) => ({ value: row.code, label: row.name }));
}

export async function loadCustomerWorkspace(
  userId: string,
  tenantIdOverride?: string,
): Promise<CustomerWorkspace> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const rows = await request<CustomerRow[]>(
    supabaseApi.get(
      '/customers',
      queryParams({
        select: '*',
        tenant_id: `eq.${tenantId}`,
        order: 'created_at.asc',
      }),
    ),
  );

  return { tenantId, customers: rows.map(mapCustomerRow) };
}

export async function loadCustomerList(
  tenantId: string,
  params: CustomerListParams,
  signal?: AbortSignal,
): Promise<CustomerListResult> {
  assertSupabaseConfigured();
  const response = await request<CustomerListRpcResponse>(
    supabaseApi.post(
      '/rpc/list_customers',
      {
        p_tenant_id: tenantId,
        p_page: params.page,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || null,
        p_customer_search: params.customerSearch?.trim() || null,
        p_business_types: params.businessTypes ?? [],
        p_contact_search: params.contactSearch?.trim() || null,
        p_statuses: params.statuses ?? [],
        p_tag_ids: params.tagIds ?? [],
      },
      { signal },
    ),
  );

  return {
    customers: response.items.map(mapCustomerRow),
    total: numberValue(response.total),
  };
}

export async function loadCustomerStatusStats(
  tenantId: string,
  signal?: AbortSignal,
): Promise<CustomerStatusStats> {
  const [all, active, inactive] = await Promise.all(
    [undefined, 'active', 'inactive'].map((status) =>
      loadCustomerList(
        tenantId,
        {
          page: 1,
          pageSize: 1,
          statuses: status ? [status as CustomerStatus] : undefined,
        },
        signal,
      ),
    ),
  );

  return {
    total: all.total,
    active: active.total,
    inactive: inactive.total,
  };
}

export async function loadCustomerDetail(
  userId: string,
  customerId: string,
  tenantIdOverride?: string,
): Promise<Customer> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const rows = await request<CustomerRow[]>(
    supabaseApi.get(
      '/customers',
      queryParams({
        select: '*',
        tenant_id: `eq.${tenantId}`,
        id: `eq.${customerId}`,
        limit: '1',
      }),
    ),
  );

  const customer = rows[0];
  if (!customer) throw new Error('Không tìm thấy khách hàng.');
  return mapCustomerRow(customer);
}

function toPayload(values: CustomerFormValues) {
  return {
    customer_code: values.customerCode,
    name: values.name,
    business_type: values.businessType,
    business_registration_code: values.businessRegistrationCode,
    image_url: values.imageUrl || null,
    country_code: values.countryCode,
    region_code: values.regionCode || null,
    region_name: values.regionName,
    phone: values.phone,
    email: values.email,
    address_detail: values.addressDetail,
    status: values.status,
    note: values.note,
  };
}

function fileExtension(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;

  return file.type === 'image/png'
    ? 'png'
    : file.type === 'image/webp'
      ? 'webp'
      : 'jpg';
}

export async function uploadCustomerImage(
  tenantId: string,
  customerId: string,
  file: File,
): Promise<string> {
  assertSupabaseConfigured();

  const path = `${tenantId}/customers/${customerId}/image.${fileExtension(file)}`;
  await uploadStorageObject({
    bucket: TENANT_ASSETS_BUCKET,
    path,
    file,
    upsert: true,
  });

  return getPublicStorageUrl(TENANT_ASSETS_BUCKET, path);
}

export async function createCustomer(
  tenantId: string,
  values: CustomerFormValues,
): Promise<Customer> {
  assertSupabaseConfigured();
  const rows = await request<CustomerRow[]>(
    supabaseApi.post(
      '/customers',
      { tenant_id: tenantId, ...toPayload(values) },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  if (!rows[0]) throw new Error('Không thể tạo khách hàng.');
  return mapCustomerRow(rows[0]);
}

export async function updateCustomer(
  customerId: string,
  values: CustomerFormValues,
): Promise<Customer> {
  assertSupabaseConfigured();
  const rows = await request<CustomerRow[]>(
    supabaseApi.patch('/customers', toPayload(values), {
      ...queryParams({ id: `eq.${customerId}` }),
      headers: { Prefer: 'return=representation' },
    }),
  );
  if (!rows[0]) throw new Error('Không tìm thấy khách hàng để cập nhật.');
  return mapCustomerRow(rows[0]);
}

export async function deleteCustomer(customerId: string): Promise<void> {
  assertSupabaseConfigured();
  await supabaseApi.delete(
    '/customers',
    queryParams({ id: `eq.${customerId}` }),
  );
}
