import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type {
  Employee,
  EmployeeAvatarRow,
  EmployeeFormValues,
  EmployeeListParams,
  EmployeeListResult,
  EmployeeListRpcRow,
  EmployeeRole,
  EmployeeRoleOption,
  EmployeeRow,
  EmployeeStatus,
} from '../model/employee';
import { mapEmployeeRow } from '../model/employee';

interface TenantMembershipRow {
  tenant_id: string;
}

interface EmployeeRoleAssignmentRow {
  user_id: string;
  role_id: string;
}

interface EmployeeRoleRow {
  id: string;
  name: string;
  color: EmployeeRole['color'];
}

interface EmployeeListRpcResponse {
  items: EmployeeListRpcRow[];
  total: number | string;
}

export interface EmployeeStatusStats {
  total: number;
  active: number;
  inactive: number;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

function numberValue(value: number | string | null | undefined) {
  return value == null ? 0 : typeof value === 'number' ? value : Number(value);
}

export interface EmployeeWorkspace {
  tenantId: string;
  employees: Employee[];
}

export async function loadEmployeeList(
  tenantId: string,
  params: EmployeeListParams,
  signal?: AbortSignal,
): Promise<EmployeeListResult> {
  assertSupabaseConfigured();
  const response = await request<EmployeeListRpcResponse>(
    supabaseApi.post(
      '/rpc/list_employees',
      {
        p_tenant_id: tenantId,
        p_page: params.page,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || null,
        p_statuses: params.statuses ?? [],
        p_role_ids: params.roleIds ?? [],
        p_account_linked: params.accountLinked ?? null,
        p_tag_ids: params.tagIds ?? [],
      },
      { signal },
    ),
  );

  return {
    employees: response.items.map((row) =>
      mapEmployeeRow(row, row.avatar_url, row.roles ?? []),
    ),
    total: numberValue(response.total),
  };
}

export async function loadEmployeeStatusStats(
  tenantId: string,
  signal?: AbortSignal,
): Promise<EmployeeStatusStats> {
  const [all, active, inactive] = await Promise.all(
    [undefined, 'active', 'inactive'].map((status) =>
      loadEmployeeList(
        tenantId,
        {
          page: 1,
          pageSize: 1,
          statuses: status ? [status as EmployeeStatus] : undefined,
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

export async function loadEmployeeRoleOptions(
  tenantId: string,
): Promise<EmployeeRoleOption[]> {
  assertSupabaseConfigured();
  return request<EmployeeRoleOption[]>(
    supabaseApi.get(
      '/roles',
      queryParams({
        select: 'id,name,color',
        tenant_id: `eq.${tenantId}`,
        is_active: 'eq.true',
        order: 'name.asc,id.asc',
      }),
    ),
  );
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

export async function loadEmployeeWorkspace(
  userId: string,
  tenantIdOverride?: string,
): Promise<EmployeeWorkspace> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const rows = await request<EmployeeRow[]>(
    supabaseApi.get(
      '/employees',
      queryParams({
        select: '*',
        tenant_id: `eq.${tenantId}`,
        order: 'created_at.asc',
      }),
    ),
  );
  const profiles = await request<EmployeeAvatarRow[]>(
    supabaseApi.get('/user_profiles', queryParams({ select: 'id,avatar_url' })),
  );
  const avatarsByUserId = new Map(
    profiles.map((profile) => [profile.id, profile.avatar_url]),
  );
  const [assignments, roles] = await Promise.all([
    request<EmployeeRoleAssignmentRow[]>(
      supabaseApi.get(
        '/tenant_member_roles',
        queryParams({
          select: 'user_id,role_id',
          tenant_id: `eq.${tenantId}`,
        }),
      ),
    ),
    request<EmployeeRoleRow[]>(
      supabaseApi.get(
        '/roles',
        queryParams({
          select: 'id,name,color',
          tenant_id: `eq.${tenantId}`,
          is_active: 'eq.true',
        }),
      ),
    ),
  ]);
  const roleById = new Map(roles.map((role) => [role.id, role]));
  const roleNamesByUserId = new Map<string, EmployeeRole[]>();
  for (const assignment of assignments) {
    const role = roleById.get(assignment.role_id);
    if (!role) continue;
    const userRoles = roleNamesByUserId.get(assignment.user_id) ?? [];
    userRoles.push({ name: role.name, color: role.color });
    roleNamesByUserId.set(assignment.user_id, userRoles);
  }

  return {
    tenantId,
    employees: rows.map((row) =>
      mapEmployeeRow(
        row,
        row.user_id ? (avatarsByUserId.get(row.user_id) ?? null) : null,
        row.user_id ? (roleNamesByUserId.get(row.user_id) ?? []) : [],
      ),
    ),
  };
}

function toPayload(values: EmployeeFormValues) {
  return {
    employee_code: values.employeeCode,
    first_name: values.firstName,
    last_name: values.lastName,
    job_title: values.jobTitle,
    department: values.department,
    phone: values.phone,
    status: values.status,
    joined_at: values.joinedAt?.toISOString().slice(0, 10) ?? null,
    note: values.note,
  };
}

export async function createEmployee(
  tenantId: string,
  values: EmployeeFormValues,
): Promise<Employee> {
  assertSupabaseConfigured();
  const rows = await request<EmployeeRow[]>(
    supabaseApi.post(
      '/employees',
      { tenant_id: tenantId, ...toPayload(values) },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  if (!rows[0]) throw new Error('Không thể tạo nhân viên.');
  return mapEmployeeRow(rows[0]);
}

export async function updateEmployee(
  employeeId: string,
  values: EmployeeFormValues,
): Promise<Employee> {
  assertSupabaseConfigured();
  const rows = await request<EmployeeRow[]>(
    supabaseApi.patch('/employees', toPayload(values), {
      ...queryParams({ id: `eq.${employeeId}` }),
      headers: { Prefer: 'return=representation' },
    }),
  );
  if (!rows[0]) throw new Error('Không tìm thấy nhân viên để cập nhật.');
  return mapEmployeeRow(rows[0]);
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  assertSupabaseConfigured();
  await supabaseApi.delete(
    '/employees',
    queryParams({ id: `eq.${employeeId}` }),
  );
}

export async function updateEmployeeStatus(
  employeeId: string,
  status: EmployeeStatus,
) {
  assertSupabaseConfigured();
  await supabaseApi.patch(
    '/employees',
    { status },
    queryParams({ id: `eq.${employeeId}` }),
  );
}
