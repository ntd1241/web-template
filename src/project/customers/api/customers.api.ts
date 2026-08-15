import { env } from '@/config/env';
import {
  assertSupabaseConfigured,
  supabaseApi,
  supabaseStorageApi,
} from '@/lib/supabase';
import { CUSTOMER_TAG_GROUP_CODE } from '../../tags/model/tag';
import type {
  Customer,
  CustomerFormValues,
  CustomerRow,
  CustomerTagFilterData,
} from '../model/customer';
import { mapCustomerRow } from '../model/customer';

interface TenantMembershipRow {
  tenant_id: string;
}

interface CustomerTagGroupRow {
  id: string;
}

interface CustomerTagRow {
  id: string;
  group_id: string;
  name: string;
  color: string | null;
  sort_order: number;
}

interface CustomerTagAssignmentRow {
  tag_id: string;
  subject_id: string;
}

interface RegionRow {
  code: string;
  name: string;
}

function queryParams(params: Record<string, string>) {
  return { params };
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
): Promise<CustomerWorkspace> {
  assertSupabaseConfigured();
  const tenantId = await resolveTenantId(userId);
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

export async function loadCustomerDetail(
  userId: string,
  customerId: string,
): Promise<Customer> {
  assertSupabaseConfigured();
  const tenantId = await resolveTenantId(userId);
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

export async function loadCustomerTagFilter(
  tenantId: string,
): Promise<CustomerTagFilterData> {
  assertSupabaseConfigured();

  const [groupRows, tagRows, assignmentRows] = await Promise.all([
    request<CustomerTagGroupRow[]>(
      supabaseApi.get(
        '/tag_groups',
        queryParams({
          select: 'id',
          tenant_id: `eq.${tenantId}`,
          code: `eq.${CUSTOMER_TAG_GROUP_CODE}`,
          is_system: 'eq.true',
          is_active: 'eq.true',
          limit: '1',
        }),
      ),
    ),
    request<CustomerTagRow[]>(
      supabaseApi.get(
        '/tags',
        queryParams({
          select: 'id,group_id,name,color,sort_order',
          tenant_id: `eq.${tenantId}`,
          is_active: 'eq.true',
          order: 'sort_order.asc,name.asc',
        }),
      ),
    ),
    request<CustomerTagAssignmentRow[]>(
      supabaseApi.get(
        '/tag_assignments',
        queryParams({
          select: 'tag_id,subject_id',
          tenant_id: `eq.${tenantId}`,
          subject_type: 'eq.customer',
        }),
      ),
    ),
  ]);

  const groupId = groupRows[0]?.id;
  const tags = groupId ? tagRows.filter((tag) => tag.group_id === groupId) : [];
  const tagIds = new Set(tags.map((tag) => tag.id));
  const customerIdsByTagId: Record<string, string[]> = {};

  for (const assignment of assignmentRows) {
    if (!tagIds.has(assignment.tag_id)) continue;
    const customerIds = customerIdsByTagId[assignment.tag_id] ?? [];
    customerIds.push(assignment.subject_id);
    customerIdsByTagId[assignment.tag_id] = customerIds;
  }

  return {
    options: tags.map((tag) => ({
      value: tag.id,
      label: tag.name,
      color: tag.color,
    })),
    customerIdsByTagId,
  };
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

const CUSTOMER_ASSETS_BUCKET = 'tenant-assets';

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
  await request<unknown>(
    supabaseStorageApi.post(`/object/${CUSTOMER_ASSETS_BUCKET}/${path}`, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
    }),
  );

  return `${env.supabaseUrl}/storage/v1/object/public/${CUSTOMER_ASSETS_BUCKET}/${path}`;
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
